import { BehaviorSubject, firstValueFrom, from, lastValueFrom, throwError } from 'rxjs';
import { filter, map, mergeMap, tap, timeout } from 'rxjs/operators';

import {
  ModuleEventLevel,
  type AnyModule,
  type ModuleEvent,
  type ModuleInitializerArgs,
} from '../../../types.js';

import { BaseModuleProvider } from '../../provider/index.js';
import { RequiredModuleTimeoutError } from '../types.js';
import { ModuleConfiguratorEventName } from '../events.js';

/**
 * Context passed to the initialize lifecycle phase.
 *
 * Bundles all state the initialize phase needs so the phase function
 * remains a pure function of its inputs and is testable in isolation.
 *
 * @internal
 */
export interface InitializePhaseContext {
  /** All registered modules to initialize. */
  modules: AnyModule[];
  /** Emits a structured lifecycle event into the configurator's event stream. */
  registerEvent: (event: ModuleEvent) => void;
}

/** @internal */
type ModuleInitContext = {
  config: unknown;
  ref: unknown;
  requireInstance: RequireInstance;
  hasModule: (name: string) => boolean;
  registerEvent: (event: ModuleEvent) => void;
};

/**
 * Concrete shape of the `requireInstance` resolver passed into each module's
 * `initialize` call. Extracted from `ModuleInitializerArgs` so call-sites stay
 * readable without repeating the `<any, any>` instantiation.
 *
 * @internal
 */
// biome-ignore lint/suspicious/noExplicitAny: ModuleInitializerArgs is generic over config and deps; at this layer both are unknown and any is the honest escape hatch
type RequireInstance = ModuleInitializerArgs<any, any>['requireInstance'];

/**
 * Initializes a single module and emits a `[name, instance]` tuple when complete.
 *
 * Validates that the module exposes an `initialize` method, calls it with the
 * provided context, and emits lifecycle events for start, completion, and any
 * provider contract warnings.
 *
 * @internal
 */
async function initializeModule(
  module: AnyModule,
  ctx: ModuleInitContext,
): Promise<readonly [string, unknown]> {
  const { config, ref, requireInstance, hasModule, registerEvent } = ctx;
  const key = module.name;

  if (!module.initialize) {
    const error = new Error(`Module ${module.name} does not have initialize method`);
    error.name = 'ModuleInitializeError';
    registerEvent({
      level: ModuleEventLevel.Error,
      name: ModuleConfiguratorEventName.ModuleInitializeError,
      message: error.message,
      properties: {
        moduleName: module.name,
        moduleVersion: module.version?.toString() || 'unknown',
      },
      error,
    });
    throw error;
  }

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.ModuleInitializing,
    message: `Initializing module ${module.name}`,
    properties: {
      moduleName: module.name,
      moduleVersion: module.version?.toString() || 'unknown',
    },
  });

  const moduleInitStart = performance.now();

  const instance = await (module.initialize({
    ref,
    config: (config as Record<string, unknown>)[key],
    requireInstance,
    hasModule,
  }) as Promise<unknown>);

  // Warn when providers deviate from the expected base class — these modules
  // may lack version tracking and standard provider interfaces.
  if (!(instance instanceof BaseModuleProvider)) {
    registerEvent({
      level: ModuleEventLevel.Warning,
      name: ModuleConfiguratorEventName.ProviderNotBaseModuleProvider,
      message: `Provider for module ${module.name} does not extend BaseModuleProvider`,
      properties: {
        moduleName: module.name,
        moduleVersion: module.version?.toString() || 'unknown',
      },
    });
  }
  // Providers should expose a version string for diagnostics and compatibility checks.
  // Warn when absent so module authors catch missing version early rather than at runtime.
  const maybeVersioned = instance as { version?: string };
  if (!maybeVersioned.version) {
    registerEvent({
      level: ModuleEventLevel.Warning,
      name: ModuleConfiguratorEventName.ProviderVersionWarning,
      message: `Provider for module ${module.name} does not expose version`,
      properties: {
        moduleName: module.name,
        moduleVersion: module.version?.toString() || 'unknown',
      },
    });
  }

  const moduleInitTime = Math.round(performance.now() - moduleInitStart);
  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.ModuleInitialized,
    message: `Module ${module.name} initialized in ${moduleInitTime}ms`,
    properties: {
      moduleName: module.name,
      moduleVersion: module.version?.toString() || 'unknown',
      providerName: typeof instance,
      providerVersion: maybeVersioned.version?.toString() || 'unknown',
      moduleInitTime,
    },
    metric: moduleInitTime,
  });

  return [key, instance] as const;
}

/**
 * Creates a `requireInstance` resolver for use during module initialization.
 *
 * `requireInstance` is passed into each module's `initialize` call so it can
 * declare dependencies on other modules without knowing whether those modules
 * have already finished initializing. The resolver waits up to `wait` seconds
 * for the target module to appear in the shared `instance$` subject.
 *
 * @param moduleNames - Names of all modules registered in this initialization run.
 * @param instance$ - Shared subject accumulating initialized module instances.
 * @param registerEvent - Function to emit lifecycle events.
 * @returns A `requireInstance` function matching the shape expected by `ModuleInitializerArgs`.
 * @internal
 */
export function createRequireInstance<T>(
  moduleNames: string[],
  instance$: BehaviorSubject<T>,
  registerEvent: (event: ModuleEvent) => void,
): RequireInstance {
  // The implementation signature is concrete (name: string) but the public contract
  // must be the generic shape expected by ModuleInitializerArgs. Module names are
  // always strings at runtime — the keyof-derived `string | number` constraint comes
  // from TypeScript's keyof semantics, not actual usage.
  return function requireInstance(name: string, wait = 60): Promise<unknown> {
    // Fail fast if the caller requests a module that was never registered —
    // this almost always indicates a misconfiguration rather than a timing issue.
    if (!moduleNames.includes(name)) {
      const error = new Error(`Cannot require [${String(name)}] since module is not defined!`);
      error.name = 'ModuleNotDefinedError';
      registerEvent({
        level: ModuleEventLevel.Error,
        name: ModuleConfiguratorEventName.RequireInstanceModuleNotDefined,
        message: error.message,
        properties: { moduleName: String(name), wait },
        error,
      });
      throw error;
    }

    // Short-circuit: module is already in the accumulated instance object
    if ((instance$.value as Record<string, unknown>)[name]) {
      registerEvent({
        level: ModuleEventLevel.Debug,
        name: ModuleConfiguratorEventName.RequireInstanceModuleAlreadyInitialized,
        message: `Module [${String(name)}] is already initialized, skipping queue`,
        properties: { moduleName: String(name), wait },
      });
      return Promise.resolve((instance$.value as Record<string, unknown>)[name]);
    }

    const requireStart = performance.now();
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.RequireInstanceAwaitingModule,
      message: `Awaiting module [${String(name)}] initialization, timeout ${wait}s`,
      properties: { moduleName: String(name), wait },
    });

    // Wait for the module to appear in the shared instance subject, up to `wait` seconds.
    return firstValueFrom(
      instance$.pipe(
        // Ignore emissions until the requested module has been added to the instance map.
        filter((x) => !!(x as Record<string, unknown>)[name]),
        // Resolve the dependency promise with the provider instance, not the full module map.
        map((x) => (x as Record<string, unknown>)[name]),
        // Convert unresolved dependencies into a typed timeout error with lifecycle diagnostics.
        timeout({
          // requireInstance accepts seconds; RxJS timeout expects milliseconds.
          each: wait * 1000,
          with: () =>
            throwError(() => {
              const error = new RequiredModuleTimeoutError();
              registerEvent({
                level: ModuleEventLevel.Error,
                name: ModuleConfiguratorEventName.RequireInstanceTimeout,
                message: `Module [${String(name)}] initialization timed out after ${wait}s`,
                properties: { moduleName: String(name), wait },
                error,
              });
              return error;
            }),
        }),
        // Emit timing diagnostics only after the dependency has actually resolved.
        tap(() => {
          const requireTime = Math.round(performance.now() - requireStart);
          registerEvent({
            level: ModuleEventLevel.Debug,
            name: ModuleConfiguratorEventName.RequireInstanceModuleResolved,
            message: `Module [${String(name)}] required in ${requireTime}ms`,
            properties: { moduleName: String(name), wait, requireTime },
            metric: requireTime,
          });
        }),
      ),
    );
  } as unknown as RequireInstance;
}

/**
 * Runs the initialize lifecycle phase for all registered modules.
 *
 * Initializes all modules **concurrently** using `mergeMap`. Cross-module
 * dependency ordering is handled lazily through `requireInstance`, which
 * waits for a peer module's `initialize` call to complete before resolving.
 *
 * Each initialized provider is accumulated into a shared `BehaviorSubject` so
 * that `requireInstance` callers see updates as soon as a dependency is ready.
 *
 * @param ctx - The initialize phase context.
 * @param config - The merged module config map produced by the configure phase.
 * @param ref - Optional reference forwarded to each module's `initialize` call.
 * @returns A promise resolving to the sealed map of initialized module providers.
 * @throws {Error} When a module's `initialize` method is missing.
 * @throws {RequiredModuleTimeoutError} When a required dependency does not
 *   initialize within its timeout window.
 */
export async function runInitializePhase<T>(
  ctx: InitializePhaseContext,
  config: unknown,
  ref?: unknown,
): Promise<T> {
  const { modules, registerEvent } = ctx;

  // Fast-path: no modules registered — return a sealed empty instance immediately
  // to avoid a subscribe/lastValueFrom race on an already-completed observable.
  if (modules.length === 0) {
    return Object.seal({}) as T;
  }

  const moduleNames = modules.map((m) => m.name);

  // Accumulates initialized module providers; BehaviorSubject lets requireInstance
  // reactively wait for a dependency to appear without polling.
  const instance$ = new BehaviorSubject<Partial<T>>({} as Partial<T>);

  const hasModule = (name: string): boolean => moduleNames.includes(name);
  const requireInstance = createRequireInstance<Partial<T>>(moduleNames, instance$, registerEvent);

  // Initialize all modules concurrently; modules that depend on peers will
  // suspend inside requireInstance until the dependency resolves.
  const init$ = from(modules).pipe(
    mergeMap((module) =>
      initializeModule(module, { config, ref, requireInstance, hasModule, registerEvent }),
    ),
  );

  const initStart = performance.now();

  // Accumulate module providers into the shared instance subject as each resolves.
  // Completing the subject signals that all modules are initialized.
  init$.subscribe({
    next: ([name, module]) => {
      instance$.next(Object.assign(instance$.value, { [name]: module }));
    },
    error: (err) => {
      registerEvent({
        level: ModuleEventLevel.Error,
        name: ModuleConfiguratorEventName.ModuleInitializeError,
        message: `Failed to initialize module ${err.name || 'unknown'}`,
        error: err,
      });
      instance$.error(err);
    },
    complete: () => {
      const loadTime = Math.round(performance.now() - initStart);
      registerEvent({
        level: ModuleEventLevel.Debug,
        name: ModuleConfiguratorEventName.ModuleInitializeComplete,
        message: `All modules initialized in ${loadTime}ms`,
        properties: {
          modules: Object.keys(instance$.value).join(', '),
          loadTime,
        },
        metric: loadTime,
      });
      instance$.complete();
    },
  });

  const instanceInitStart = performance.now();
  const instance = await lastValueFrom(instance$);
  const initTime = Math.round(performance.now() - instanceInitStart);

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.InitializeComplete,
    message: `Modules instance created in ${initTime}ms`,
    properties: {
      modules: Object.keys(instance).join(', '),
      initTime,
    },
    metric: initTime,
  });

  Object.seal(instance);

  return instance as T;
}

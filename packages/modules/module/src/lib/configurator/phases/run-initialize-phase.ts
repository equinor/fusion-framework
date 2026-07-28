import { BehaviorSubject, from, lastValueFrom } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ModuleEventLevel, type AnyModule, type ModuleEvent } from '../../../types.js';

import { BaseModuleProvider } from '../../provider/index.js';
import { ModuleConfiguratorEventName } from '../module-configurator-event-name.js';
import {
  createRequireInstance,
  type InitializePhaseContext,
  type RequireInstance,
} from './create-require-instance.js';

/** @internal */
type ModuleInitContext = {
  config: unknown;
  ref: unknown;
  requireInstance: RequireInstance;
  hasModule: (name: string) => boolean;
  registerEvent: (event: ModuleEvent) => void;
};

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

  // Modules must expose an initialize method to participate in the initialize phase
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
  // Only warn about missing version metadata now that we know it's actually absent
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
 * @template T - The shape of the resolved module instance map.
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

  // Extract module names for dependency lookups before any module has initialized
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
      // Merge the newly initialized module into the shared instance map without dropping peers
      const nextInstance = Object.assign(instance$.value, { [name]: module });
      instance$.next(nextInstance);
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

export default runInitializePhase;

import { type BehaviorSubject, firstValueFrom, throwError } from 'rxjs';
import { filter, map, tap, timeout } from 'rxjs/operators';

import {
  ModuleEventLevel,
  type AnyModule,
  type ModuleEvent,
  type ModuleInitializerArgs,
} from '../../../types.js';

import { RequiredModuleTimeoutError } from '../types.js';
import { ModuleConfiguratorEventName } from '../module-configurator-event-name.js';

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

/**
 * Concrete shape of the `requireInstance` resolver passed into each module's
 * `initialize` call. Extracted from `ModuleInitializerArgs` so call-sites stay
 * readable without repeating the `<any, any>` instantiation.
 *
 * @internal
 */
// biome-ignore lint/suspicious/noExplicitAny: ModuleInitializerArgs is generic over config and deps; at this layer both are unknown and any is the honest escape hatch
export type RequireInstance = ModuleInitializerArgs<any, any>['requireInstance'];

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
 * @template T - The shape of the accumulated module instance map.
 * @throws {Error} When the requested module name was never registered.
 * @throws {RequiredModuleTimeoutError} When the requested module does not
 *   initialize within its timeout window.
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

export default createRequireInstance;

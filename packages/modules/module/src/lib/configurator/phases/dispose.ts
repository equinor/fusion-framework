/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Subject } from 'rxjs';

import { ModuleEventLevel, type AnyModule, type ModuleEvent } from '../../../types.js';

/**
 * Context passed to the dispose lifecycle phase.
 *
 * @internal
 */
export interface DisposePhaseContext {
  /** All registered modules — only those with a `dispose` hook are processed. */
  modules: AnyModule[];
  /** Emits a structured lifecycle event into the configurator's event stream. */
  registerEvent: (event: ModuleEvent) => void;
  /**
   * The configurator's internal event subject. Completed after all modules
   * are disposed to signal that the lifecycle is fully torn down.
   */
  event$: Subject<ModuleEvent>;
}

/**
 * Runs the dispose lifecycle phase for all registered modules.
 *
 * Calls each module's `dispose` hook (if defined) concurrently via
 * `Promise.allSettled` so one failing module cannot block others from
 * being torn down. After all hooks settle, the event stream is completed.
 *
 * @param ctx - The dispose phase context.
 * @param instance - The initialized module instance map to tear down.
 * @param ref - Optional reference forwarded to each module's `dispose` call.
 * @returns A promise resolving when all module dispose hooks have settled and
 *   the event stream has been completed.
 */
export async function runDisposePhase(
  ctx: DisposePhaseContext,
  instance: Record<string, unknown>,
  ref?: unknown,
): Promise<void> {
  const { modules, registerEvent, event$ } = ctx;

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: 'dispose',
    message: 'Disposing modules instance',
    properties: { modules: Object.keys(instance).join(', ') },
  });

  // Dispose all modules concurrently; failures are isolated per module so
  // one bad teardown cannot leave other modules in an inconsistent state.
  await Promise.allSettled(
    modules
      .filter((module) => !!module.dispose)
      .map(async (module) => {
        if (!module.dispose) return;
        try {
          await module.dispose({
            ref,
            modules: instance,
            instance: instance[module.name],
          });
          registerEvent({
            level: ModuleEventLevel.Debug,
            name: 'dispose.moduleDisposed',
            message: `Module ${module.name} disposed successfully`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
          });
        } catch (err) {
          registerEvent({
            level: ModuleEventLevel.Warning,
            name: 'dispose.moduleDisposeError',
            message: `Module ${module.name} dispose failed`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
            error: err,
          });
        }
      }),
  );

  // Complete the event stream last so all dispose events are captured before
  // any subscriber teardown triggered by completion.
  event$.complete();
}

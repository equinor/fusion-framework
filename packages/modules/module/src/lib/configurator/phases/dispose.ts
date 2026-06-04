import type { Subject } from 'rxjs';

import { ModuleEventLevel, type AnyModule, type ModuleEvent } from '../../../types.js';
import type { FrameworkPluginTeardown } from '../../plugin/index.js';
import { ModuleConfiguratorEventName } from '../events.js';

function getPluginTeardownName(teardown: FrameworkPluginTeardown): string {
  return typeof teardown === 'function' ? teardown.name || 'anonymous' : 'dispose';
}

async function runPluginTeardown(teardown: FrameworkPluginTeardown): Promise<void> {
  if (typeof teardown === 'function') {
    await teardown();
    return;
  }
  await teardown.dispose();
}

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
  /** Plugin teardown callbacks registered during the plugin phase. */
  pluginTeardowns?: FrameworkPluginTeardown[];
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
  const { modules, registerEvent, event$, pluginTeardowns = [] } = ctx;

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.Dispose,
    message: 'Disposing modules instance',
    properties: { modules: Object.keys(instance).join(', ') },
  });

  if (pluginTeardowns.length) {
    registerEvent({
      level: ModuleEventLevel.Debug,
      name: ModuleConfiguratorEventName.PluginsDisposing,
      message: `Disposing plugins [${pluginTeardowns.length}]`,
      properties: { count: pluginTeardowns.length },
    });

    // Tear down plugins before module providers so side effects can still access
    // live providers while unsubscribing. LIFO mirrors common subscription stacks.
    for (const teardown of pluginTeardowns.splice(0).reverse()) {
      const name = getPluginTeardownName(teardown);
      try {
        await runPluginTeardown(teardown);
        registerEvent({
          level: ModuleEventLevel.Debug,
          name: ModuleConfiguratorEventName.PluginDisposed,
          message: `Plugin ${name} disposed successfully`,
          properties: { name },
        });
      } catch (err) {
        registerEvent({
          level: ModuleEventLevel.Warning,
          name: ModuleConfiguratorEventName.PluginDisposeError,
          message: `Plugin ${name} dispose failed`,
          properties: { name },
          error: err,
        });
      }
    }
  }

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.ModulesDispose,
    message: 'Disposing modules',
    properties: { count: modules.length },
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
            name: ModuleConfiguratorEventName.ModuleDisposed,
            message: `Module ${module.name} disposed successfully`,
            properties: {
              moduleName: module.name,
              moduleVersion: module.version?.toString() || 'unknown',
            },
          });
        } catch (err) {
          registerEvent({
            level: ModuleEventLevel.Warning,
            name: ModuleConfiguratorEventName.ModuleDisposeError,
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

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.ModulesDisposed,
    message: 'Module dispose complete',
    properties: { count: modules.length },
  });

  // Complete the event stream last so all dispose events are captured before
  // any subscriber teardown triggered by completion.
  event$.complete();
}

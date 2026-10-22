/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Subject } from 'rxjs';

import {
  ModuleEventLevel,
  type AnyModule,
  type ModuleDisposePhase,
  type ModuleEvent,
} from '../../../types.js';
import type { FrameworkPluginTeardown } from '../../plugin/index.js';
import { ModuleConfiguratorEventName } from '../module-configurator-event-name.js';

/** Fixed teardown order: ordinary modules first, so diagnostics and events can still record them. */
const disposePhaseOrder: readonly ModuleDisposePhase[] = ['default', 'diagnostics', 'events'];

function getPluginTeardownName(teardown: FrameworkPluginTeardown): string {
  return typeof teardown === 'function' ? teardown.name || 'anonymous' : 'dispose';
}

async function runPluginTeardown(teardown: FrameworkPluginTeardown): Promise<void> {
  // Function-shaped teardowns are called directly; object-shaped ones expose a dispose() method
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
 * Calls module `dispose` hooks concurrently within each fixed phase:
 * default, diagnostics, then events. Rejections are isolated through
 * `Promise.allSettled`. After all hooks settle, the event stream is completed.
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
  const start = performance.now();
  let failed = false;

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.Dispose,
    message: 'Disposing modules instance',
    properties: { modules: Object.keys(instance).join(', ') },
  });

  // Only run the plugin teardown sequence when plugins were actually registered
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
        failed = true;
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

  const groups: Record<ModuleDisposePhase, AnyModule[]> = {
    default: [],
    diagnostics: [],
    events: [],
  };
  // Partition once so invalid runtime input cannot silently omit a provider's cleanup.
  for (const module of modules) {
    const phase = module.disposePhase ?? 'default';
    // Only named lifecycle phases may delay cleanup until infrastructure shutdown.
    if (disposePhaseOrder.includes(phase)) {
      groups[phase].push(module);
    } else {
      failed = true;
      registerEvent({
        level: ModuleEventLevel.Warning,
        name: ModuleConfiguratorEventName.ModulesDispose,
        message: `Unsupported disposal phase for module ${module.name}; disposing during the default phase`,
        properties: { moduleName: module.name },
        error: new TypeError('Unsupported module disposal phase'),
      });
      groups.default.push(module);
    }
  }

  // Diagnostic infrastructure stays alive through ordinary module teardown.
  for (const phase of disposePhaseOrder) {
    await Promise.allSettled(
      groups[phase]
        // Only process modules that define a dispose hook
        .filter((module) => !!module.dispose)
        // Dispose each module that defines the hook
        .map(async (module) => {
          // Narrow the type for TypeScript; the filter above already guarantees this
          if (!module.dispose) return;
          const moduleStart = performance.now();
          try {
            await module.dispose({
              ref,
              modules: instance,
              instance: instance[module.name],
            });
            registerEvent({
              level: ModuleEventLevel.Debug,
              name: ModuleConfiguratorEventName.ModuleDisposed,
              metric: performance.now() - moduleStart,
              message: `Module ${module.name} disposed successfully`,
              properties: {
                moduleName: module.name,
                moduleVersion: module.version?.toString() || 'unknown',
              },
            });
          } catch (err) {
            failed = true;
            registerEvent({
              level: ModuleEventLevel.Warning,
              name: ModuleConfiguratorEventName.ModuleDisposeError,
              metric: performance.now() - moduleStart,
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
    // Emit exactly one host outcome before flushing sinks, including when no sinks exist.
    if (phase === 'default') {
      registerEvent({
        level: failed ? ModuleEventLevel.Warning : ModuleEventLevel.Information,
        name: ModuleConfiguratorEventName.ModulesDisposed,
        message: 'Default module disposal complete; flushing lifecycle sinks',
        metric: performance.now() - start,
        properties: { count: modules.length, failed },
      });
    }
  }

  // Complete the event stream last so all dispose events are captured before
  // any subscriber teardown triggered by completion.
  event$.complete();
}

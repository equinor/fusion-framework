// biome-ignore-all lint/suspicious/noExplicitAny: internal type-erased dispatch — plugins are registered with concrete module maps but stored erased by the orchestrator
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModuleEventLevel, type ModuleEvent } from '../../../types.js';
import type { FrameworkPluginCallback, FrameworkPluginTeardown } from '../../plugin/index.js';

function isPluginTeardown(value: unknown): value is FrameworkPluginTeardown {
  return (
    typeof value === 'function' ||
    (typeof value === 'object' &&
      value !== null &&
      'dispose' in value &&
      typeof value.dispose === 'function')
  );
}

/**
 * Context passed to the plugin lifecycle phase.
 *
 * @internal
 */
export interface PluginPhaseContext<TRef = unknown> {
  /** Registered plugin callbacks to run after module initialization. */
  plugins: Array<FrameworkPluginCallback<any, TRef>>;
  /** Mutable teardown registry consumed by the dispose phase. */
  teardowns: FrameworkPluginTeardown[];
  /** Emits a structured lifecycle event into the configurator's event stream. */
  registerEvent: (event: ModuleEvent) => void;
}

/**
 * Runs configurator plugins after modules are ready.
 *
 * Executes all registered plugins with the initialized module map. Plugin
 * failures are isolated and emitted as warning events so one failing side
 * effect cannot block application rendering. Returned teardown callbacks are
 * stored for the dispose phase.
 *
 * @param ctx - The plugin phase context.
 * @param modules - The initialized module instance map.
 * @param ref - Optional reference forwarded from module initialization.
 * @returns A promise resolving when all plugin callbacks have settled.
 */
export async function runPluginPhase<TRef = unknown>(
  ctx: PluginPhaseContext<TRef>,
  modules: Record<string, unknown>,
  ref?: TRef,
): Promise<void> {
  const { plugins, teardowns, registerEvent } = ctx;

  if (!plugins.length) return;

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: '_plugin.pluginsRegistering',
    message: `Registering plugins [${plugins.length}]`,
    properties: { count: plugins.length },
  });

  await Promise.allSettled(
    plugins.map(async (plugin) => {
      const pluginStart = performance.now();
      const name = plugin.name || 'anonymous';
      try {
        const teardown = await plugin({ modules, ref });
        if (isPluginTeardown(teardown)) {
          teardowns.push(teardown);
        }
        const pluginTime = Math.round(performance.now() - pluginStart);
        registerEvent({
          level: ModuleEventLevel.Debug,
          name: '_plugin.pluginRegistered',
          message: `Plugin ${name} registered in ${pluginTime}ms`,
          properties: { name, pluginTime },
          metric: pluginTime,
        });
      } catch (err) {
        registerEvent({
          level: ModuleEventLevel.Warning,
          name: '_plugin.pluginRegisterError',
          message: `Plugin ${name} registration failed`,
          properties: { name },
          error: err,
        });
      }
    }),
  );

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: '_plugin.pluginsRegistered',
    message: 'Plugin registration complete',
    properties: { count: plugins.length, teardowns: teardowns.length },
  });
}

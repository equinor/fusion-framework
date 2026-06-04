// biome-ignore-all lint/suspicious/noExplicitAny: internal type-erased dispatch — plugins are registered with concrete module maps but stored erased by the orchestrator
import { ModuleEventLevel, type ModuleEvent } from '../../../types.js';
import type { FrameworkPluginCallback, FrameworkPluginTeardown } from '../../plugin/index.js';
import { ModuleConfiguratorEventName } from '../events.js';

/**
 * Checks whether a plugin return value should be treated as dispose-time cleanup.
 *
 * Plugins may return either a plain callback or an object with a `dispose` method.
 * Any other value is ignored so plugin authors can return `undefined` when no
 * cleanup is needed.
 *
 * @param value - Value returned by a registered plugin callback.
 * @returns True when the value is a valid plugin teardown registration.
 */
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
 * The plugin phase is the final initialization step before `initialize()`
 * resolves. Each plugin receives the sealed module instance map and optional
 * initialization reference, which makes this phase suitable for application
 * side effects such as telemetry bridges, global event listeners, and runtime
 * subscriptions that require multiple initialized module providers.
 *
 * Plugin callbacks run concurrently. Failures are isolated and emitted as
 * warning events so one failing side effect cannot block application rendering.
 * Returned teardown callbacks are stored for the dispose phase and are invoked
 * before module `dispose` hooks.
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
    name: ModuleConfiguratorEventName.PluginsRegister,
    message: `Registering plugins [${plugins.length}]`,
    properties: { count: plugins.length },
  });

  const pluginRegistrations = await Promise.all(
    plugins.map(async (plugin) => {
      const pluginStart = performance.now();
      const name = plugin.name || 'anonymous';
      try {
        const teardown = await plugin({ modules, ref });
        const pluginTime = Math.round(performance.now() - pluginStart);
        registerEvent({
          level: ModuleEventLevel.Debug,
          name: ModuleConfiguratorEventName.PluginRegistered,
          message: `Plugin ${name} registered in ${pluginTime}ms`,
          properties: { name, pluginTime },
          metric: pluginTime,
        });
        return isPluginTeardown(teardown) ? teardown : undefined;
      } catch (err) {
        registerEvent({
          level: ModuleEventLevel.Warning,
          name: ModuleConfiguratorEventName.PluginRegisterError,
          message: `Plugin ${name} registration failed`,
          properties: { name },
          error: err,
        });
        return undefined;
      }
    }),
  );

  for (const teardown of pluginRegistrations) {
    if (teardown) {
      teardowns.push(teardown);
    }
  }

  registerEvent({
    level: ModuleEventLevel.Debug,
    name: ModuleConfiguratorEventName.PluginsRegistered,
    message: 'Plugin registration complete',
    properties: { count: plugins.length, teardowns: teardowns.length },
  });
}

import type { AnyModule } from '../../types.js';
import type { FrameworkPlugin, FrameworkPluginInitializer } from './types.js';

/**
 * Creates a named framework plugin callback for module configurators.
 *
 * Use `createPlugin` when a plugin should have a stable lifecycle event name
 * without relying on JavaScript function name inference. The returned callback
 * can be passed directly to {@link IModulesConfigurator.registerPlugin}.
 *
 * @template TModules - Module descriptors available to the plugin.
 * @template TRef - Optional reference object forwarded from initialization.
 * @param name - Stable plugin name used in lifecycle events and diagnostics.
 * @param callback - Plugin callback that runs after modules initialize.
 * @returns A named framework plugin callback.
 * @throws {Error} When the plugin name is empty or whitespace.
 * @example
 * ```typescript
 * const contextTelemetryPlugin = createPlugin<[EventModule, TelemetryModule]>(
 *   'contextTelemetry',
 *   (modules) => modules.event.addEventListener('context:changed', (event) => {
 *     modules.telemetry.track('context.changed', event.detail);
 *   }),
 * );
 *
 * configurator.registerPlugin(contextTelemetryPlugin);
 * ```
 */
export function createPlugin<TModules extends Array<AnyModule>, TRef = unknown>(
  name: string,
  callback: FrameworkPluginInitializer<TModules, TRef>,
): FrameworkPlugin<TModules, TRef> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error('Framework plugin name must be a non-empty string');
  }

  const plugin = ((args) => callback(args.modules, args.ref)) as FrameworkPlugin<TModules, TRef>;

  Object.defineProperty(plugin, 'name', {
    value: normalizedName,
    configurable: true,
  });

  return plugin;
}

import type { AnyModule, ModulesInstanceType } from '../../types.js';

/**
 * Cleanup callback returned by a configurator plugin.
 *
 * The callback runs during {@link IModulesConfigurator.dispose} and should undo
 * subscriptions, global event listeners, telemetry bindings, or other side
 * effects created by {@link IModulesConfigurator.registerPlugin}.
 *
 * @example
 * ```typescript
 * function removeContextTelemetry(): void {
 *   window.removeEventListener('context:changed', handleContextChange);
 * }
 * ```
 */
export type FrameworkPluginTeardown =
  | (() => void | Promise<void>)
  | { dispose: () => void | Promise<void> };

/**
 * Registration returned by a configurator plugin.
 *
 * Return `undefined` when the plugin has no cleanup work, or return a teardown
 * callback that should run during dispose.
 *
 * @example
 * ```typescript
 * function connectTelemetry(): FrameworkPluginRegistration {
 *   const subscription = telemetry.events.subscribe(handleTelemetryEvent);
 *
 *   return {
 *     dispose: () => subscription.unsubscribe(),
 *   };
 * }
 * ```
 */
export type FrameworkPluginRegistration = FrameworkPluginTeardown | undefined;

/**
 * Arguments passed to a framework plugin callback.
 *
 * Plugins receive the initialized module map and the optional reference that
 * was forwarded through module initialization.
 *
 * @template TModules - Module descriptors available to the plugin.
 * @template TRef - Optional reference object forwarded from initialization.
 * @example
 * ```typescript
 * function connectContextTelemetry({
 *   modules,
 *   ref,
 * }: FrameworkPluginArgs<[EventModule, TelemetryModule], FrameworkRef>) {
 *   modules.telemetry.track('framework.ready', { source: ref?.source });
 * }
 * ```
 */
export interface FrameworkPluginArgs<TModules extends Array<AnyModule>, TRef = unknown> {
  /** Initialized module instance map available after all modules are ready. */
  modules: ModulesInstanceType<TModules>;
  /** Optional reference object forwarded from module initialization. */
  ref?: TRef;
}

/**
 * Named framework plugin callback created by {@link createPlugin}.
 *
 * The function name is used in lifecycle events and diagnostics while preserving
 * the callback signature accepted by {@link IModulesConfigurator.registerPlugin}.
 *
 * @template TModules - Module descriptors available to the plugin.
 * @template TRef - Optional reference object forwarded from initialization.
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
export interface FrameworkPlugin<TModules extends Array<AnyModule>, TRef = unknown> {
  /** Runs the plugin after modules are initialized. */
  (
    args: FrameworkPluginArgs<TModules, TRef>,
  ): FrameworkPluginRegistration | Promise<FrameworkPluginRegistration>;
}

/**
 * Developer-facing callback used by {@link createPlugin}.
 *
 * The callback receives the initialized module map directly instead of the
 * lower-level args object used by {@link IModulesConfigurator.registerPlugin}.
 *
 * @template TModules - Module descriptors available to the plugin.
 * @template TRef - Optional reference object forwarded from initialization.
 * @param modules - Initialized module map available after all modules are ready.
 * @param ref - Optional reference object forwarded from module initialization.
 * @returns Optional teardown callback invoked when the module instance is disposed.
 * @example
 * ```typescript
 * const contextTelemetryPlugin = createPlugin<[EventModule, TelemetryModule]>(
 *   'contextTelemetry',
 *   (modules) => modules.event.addEventListener('context:changed', (event) => {
 *     modules.telemetry.track('context.changed', event.detail);
 *   }),
 * );
 * ```
 */
export type FrameworkPluginInitializer<TModules extends Array<AnyModule>, TRef = unknown> = (
  modules: ModulesInstanceType<TModules>,
  ref?: TRef,
) => FrameworkPluginRegistration | Promise<FrameworkPluginRegistration>;

/**
 * Callback registered through {@link IModulesConfigurator.registerPlugin}.
 *
 * Plugins run after all modules have initialized and after post-initialize hooks
 * have settled. Return a teardown callback when the plugin creates side effects
 * that must be cleaned up during dispose.
 *
 * @template TModules - Module descriptors available to the plugin.
 * @template TRef - Optional reference object forwarded from initialization.
 * @param args - Initialized module map and optional initialization reference.
 * @returns Optional teardown callback invoked when the module instance is disposed.
 * @example
 * ```typescript
 * function connectContextTelemetry({
 *   modules,
 * }: FrameworkPluginArgs<[EventModule, TelemetryModule]>): FrameworkPluginRegistration {
 *   const teardown = modules.event.addEventListener('context:changed', (event) => {
 *     modules.telemetry.track('context.changed', event.detail);
 *   });
 *
 *   return teardown;
 * }
 *
 * configurator.registerPlugin(connectContextTelemetry);
 * ```
 */
export type FrameworkPluginCallback<TModules extends Array<AnyModule>, TRef = unknown> =
  | FrameworkPlugin<TModules, TRef>
  | ((
      args: FrameworkPluginArgs<TModules, TRef>,
    ) => FrameworkPluginRegistration | Promise<FrameworkPluginRegistration>);

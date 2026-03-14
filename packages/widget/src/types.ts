import type { Fusion } from '@equinor/fusion-framework';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type {
  WidgetManifest,
  WidgetModulesInstance,
  WidgetRenderArgs,
} from '@equinor/fusion-framework-module-widget';

import type { IWidgetConfigurator } from './WidgetConfigurator';

/**
 * Re-exports from `@equinor/fusion-framework-module-widget` for convenience.
 *
 * - {@link WidgetManifest} – Describes a widget's identity, version, and asset location.
 * - {@link WidgetModules} – Union of core modules (event, service-discovery) plus any custom modules.
 * - {@link WidgetModulesInstance} – The initialized runtime instance of {@link WidgetModules}.
 */
export type {
  WidgetManifest,
  WidgetModules,
  WidgetModulesInstance,
} from '@equinor/fusion-framework-module-widget';

/**
 * Environment arguments passed to a widget during module initialization.
 *
 * Contains the widget {@link WidgetManifest | manifest} and optional
 * consumer-provided props. Use `WidgetEnv` in custom
 * {@link WidgetModuleInitiator} callbacks to read manifest metadata or
 * receive configuration from the host application.
 *
 * @template TProps - Shape of optional properties forwarded from the widget host.
 *
 * @example
 * ```ts
 * const init = configureWidgetModules((configurator, { env }) => {
 *   console.log('Loading widget:', env.manifest.name);
 * });
 * ```
 */
export type WidgetEnv<TProps = unknown> = {
  /** The widget manifest describing identity, version and asset entry point. */
  manifest: WidgetManifest;
  /** Reserved for future backend-provided configuration. Currently unused. */
  config?: null;
  /** Optional consumer-provided properties forwarded by the widget host. */
  props?: TProps;
};

/**
 * Callback used to configure widget modules before they are initialized.
 *
 * Pass a `WidgetModuleInitiator` to {@link configureWidgetModules} to register
 * HTTP clients, MSAL auth, service-discovery bindings, or any custom modules
 * your widget requires. The callback receives an {@link IWidgetConfigurator}
 * and the current {@link WidgetRenderArgs} so you can read the Fusion runtime
 * and environment while configuring.
 *
 * @template TModules - Additional modules beyond the default widget module set.
 * @template TRef - Fusion runtime type (defaults to {@link Fusion}).
 * @template TEnv - Widget environment shape (defaults to {@link WidgetEnv}).
 *
 * @param configurator - The widget module configurator instance.
 * @param args - Render-time arguments containing the Fusion runtime and widget environment.
 * @returns void or a Promise that resolves when async configuration is complete.
 *
 * @example
 * ```ts
 * const init = configureWidgetModules<[typeof myModule]>((configurator, { fusion }) => {
 *   configurator.configureMsal({
 *     tenantId: 'my-tenant-id',
 *     clientId: 'my-client-id',
 *     redirectUri: '/authentication/login-callback',
 *   });
 *   configurator.configure(myModule);
 * });
 * ```
 */
export type WidgetModuleInitiator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends Fusion = Fusion,
  TEnv = WidgetEnv,
> = (
  configurator: IWidgetConfigurator<TModules, TRef['modules']>,
  args: WidgetRenderArgs<TRef, TEnv>,
) => void | Promise<void>;

/**
 * Function signature for creating a widget initialization pipeline.
 *
 * Accepts a {@link WidgetModuleInitiator} callback and returns an async
 * initializer that, given a Fusion runtime and widget environment, produces
 * a fully initialized {@link WidgetModulesInstance}.
 *
 * Typically you will not implement this type directly — use
 * {@link configureWidgetModules} which satisfies this contract.
 *
 * @template TModules - Additional modules beyond the default widget module set.
 * @template TRef - Fusion runtime type (defaults to {@link Fusion}).
 * @template TEnv - Widget environment shape (defaults to {@link WidgetEnv}).
 *
 * @param cb - Configuration callback invoked before modules initialize.
 * @returns An async function that initializes and returns widget modules.
 */
export type WidgetModuleInit<
  TModules extends Array<AnyModule> | unknown,
  TRef extends Fusion = Fusion,
  TEnv = WidgetEnv,
> = (
  cb: WidgetModuleInitiator<TModules, TRef, TEnv>,
) => (args: { fusion: TRef; env: TEnv }) => Promise<WidgetModulesInstance<TModules>>;

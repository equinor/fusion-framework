import type { Fusion } from '@equinor/fusion-framework';

import type { AnyModule } from '@equinor/fusion-framework-module';

import type {
  AppConfig,
  AppManifest,
  AppModulesInstance,
  ComponentRenderArgs,
} from '@equinor/fusion-framework-module-app';

import type { IAppConfigurator } from './AppConfigurator';
import type { ConfigEnvironment } from '@equinor/fusion-framework-module-app';

/**
 * Re-exported application module types from `@equinor/fusion-framework-module-app`.
 *
 * - `AppModules` — union of default application modules
 * - `AppManifest` — application manifest metadata (app key, version, etc.)
 * - `AppConfig` — environment-specific application configuration
 * - `AppModulesInstance` — resolved module instances after initialization
 */
export type {
  AppModules,
  AppManifest,
  AppConfig,
  AppModulesInstance,
} from '@equinor/fusion-framework-module-app';

/**
 * Environment descriptor passed to the application during module initialization.
 *
 * Contains the application manifest, optional config (with endpoint definitions),
 * an optional base path for routing, and optional component props.
 *
 * @template TConfig - Shape of the environment-specific configuration object.
 * @template TProps - Additional properties forwarded to the application component (currently unused).
 */
export type AppEnv<TConfig extends ConfigEnvironment = ConfigEnvironment, TProps = unknown> = {
  /** Base routing path of the application (e.g. `/apps/my-app`). */
  basename?: string;
  /** Application manifest describing the app key, version, and build metadata. */
  manifest: AppManifest;
  /** Environment-specific configuration with optional endpoint definitions. */
  config?: AppConfig<TConfig>;
  /** Optional properties forwarded to the application component. */
  props?: TProps;
};

/**
 * Configuration callback for setting up application modules.
 *
 * This is the function signature accepted by {@link configureModules}. Implement
 * this callback to register HTTP clients, enable bookmarks, and add custom modules
 * to the application’s module pipeline.
 *
 * @template TModules - Additional modules registered by the application.
 * @template TRef - The Fusion instance type used as a configuration reference.
 * @template TEnv - The application environment descriptor.
 *
 * @param configurator - The application configurator with HTTP and module helpers.
 * @param args - Object containing the Fusion instance and the application environment.
 * @returns `void` or a `Promise<void>` for async configuration steps.
 *
 * @example
 * ```ts
 * import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
 *
 * const configure: AppModuleInitiator = (configurator, { fusion, env }) => {
 *   configurator.useFrameworkServiceClient('portal-api');
 * };
 * ```
 */
export type AppModuleInitiator<
  TModules extends Array<AnyModule> | unknown = unknown,
  TRef extends Fusion = Fusion,
  TEnv = AppEnv,
> = (
  configurator: IAppConfigurator<TModules, TRef['modules']>,
  args: { fusion: TRef; env: TEnv },
) => void | Promise<void>;

/**
 * Factory type that wraps {@link AppModuleInitiator} into a complete initializer.
 *
 * Accepts a configuration callback and returns an async function that, given the
 * Fusion instance and environment, produces the initialized module instance.
 * This is the signature of the {@link configureModules} function itself.
 *
 * @template TModules - Additional modules registered by the application.
 * @template TRef - The Fusion instance type used as a configuration reference.
 * @template TEnv - The application environment descriptor.
 */
export type AppModuleInit<
  TModules extends Array<AnyModule> | unknown = [],
  TRef extends Fusion = Fusion,
  TEnv = AppEnv,
> = (
  cb: AppModuleInitiator<TModules, TRef, TEnv>,
) => (args: AppModuleInitArgs<TRef, TEnv>) => Promise<AppModulesInstance<TModules>>;

/**
 * Arguments passed to the async initializer returned by {@link configureModules}.
 *
 * @template TRef - The Fusion instance type.
 * @template TEnv - The application environment descriptor.
 */
export type AppModuleInitArgs<TRef extends Fusion = Fusion, TEnv = AppEnv> = {
  fusion: TRef;
  env: TEnv;
};

/**
 * Render function signature for mounting a Fusion application into the DOM.
 *
 * Called by the Fusion portal or dev-server to render the application. The
 * function receives the root element and render arguments (Fusion instance,
 * environment, and modules) and optionally returns a cleanup function that
 * is invoked when the application is unmounted.
 *
 * @template TFusion - The Fusion instance type providing framework modules.
 * @template TEnv - The application environment descriptor.
 *
 * @param el - The root HTML element where the application will be rendered.
 * @param args - Render arguments including the Fusion instance, environment,
 *               and resolved modules.
 * @returns A cleanup / teardown function, or `void` if no cleanup is needed.
 *
 * @example
 * ```ts
 * import type { AppRenderFn } from '@equinor/fusion-framework-app';
 * import { createRoot } from 'react-dom/client';
 *
 * export const renderApp: AppRenderFn = (el, args) => {
 *   const root = createRoot(el);
 *   root.render(<App />);
 *   return () => root.unmount();
 * };
 * ```
 */
export type AppRenderFn<TFusion extends Fusion = Fusion, TEnv = AppEnv> = (
  el: HTMLHtmlElement,
  args: ComponentRenderArgs<TFusion, TEnv>,
) => VoidFunction | void;

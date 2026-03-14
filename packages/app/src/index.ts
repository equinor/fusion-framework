/**
 * @packageDocumentation
 *
 * `@equinor/fusion-framework-app` provides the configuration and initialization
 * layer for Fusion applications. Use this package to set up application modules,
 * configure HTTP clients, enable bookmarks, and integrate with telemetry and
 * service discovery.
 *
 * The main entry points are:
 *
 * - {@link configureModules} — factory that creates an application initializer
 * - {@link AppConfigurator} / {@link IAppConfigurator} — configurator for registering modules and HTTP clients
 * - Type aliases such as {@link AppModuleInitiator}, {@link AppEnv}, and {@link AppRenderFn}
 *
 * Bookmark support is available via the `@equinor/fusion-framework-app/enable-bookmark`
 * sub-path export.
 */

export { AppConfigurator, IAppConfigurator } from './AppConfigurator';

export * from './types';

export { configureModules, default } from './configure-modules';

/**
 * @deprecated Use {@link configureModules} instead. This alias will be removed in a future major version.
 */
export { configureModules as initAppModules } from './configure-modules';

/**
 * [[include:react-app/README.MD]]
 * @module
 */

export type {
    AppConfig,
    AppEnv,
    AppModuleInitiator,
    AppModules,
    AppModulesInstance,
    AppManifest,
    IAppConfigurator,
} from '@equinor/fusion-framework-app';

export { useAppModule } from './useAppModule';
export { useAppModules } from './useAppModules';

export { makeComponent, ComponentRenderArgs } from './make-component';

export { createLegacyApp } from './create-legacy-app';

// TODO deprecate
export { renderApp } from './render-app';
export { createComponent } from './create-component';
export { renderComponent } from './render-component';

export type { ComponentRenderer } from './create-component';

export { default } from './render-app';

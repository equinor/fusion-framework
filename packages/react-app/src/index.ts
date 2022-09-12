/**
 * [[include:react-app/README.MD]]
 * @module
 */

export type {
    AppConfigurator,
    AppModules,
    AppModulesInstance,
    AppManifest,
} from '@equinor/fusion-framework-app';

export { useAppModule } from './useAppModule';
export { useAppModules } from './useAppModules';

export { renderApp } from './render-app';
export { createComponent } from './create-component';
export { renderComponent } from './render-component';
export { createLegacyApp } from './create-legacy-app';

export { default } from './render-app';

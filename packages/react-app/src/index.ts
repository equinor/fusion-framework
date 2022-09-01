/**
 * [[include:react-app/README.MD]]
 * @module
 */

export { appModules } from '@equinor/fusion-framework-app';

export type {
    AppConfigurator,
    AppConfigCallback,
    AppModules,
    AppModulesInstance,
    AppManifest,
} from '@equinor/fusion-framework-app';

export { useAppModule } from './useAppModule';
export { useAppModules } from './useAppModules';

export { createApp } from './create-app';

export { default } from './create-app';

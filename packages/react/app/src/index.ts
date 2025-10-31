export type {
  AppConfig,
  AppEnv,
  AppModuleInitiator,
  AppModules,
  AppModulesInstance,
  AppRenderFn,
  IAppConfigurator,
} from '@equinor/fusion-framework-app';

export { AppManifest } from '@equinor/fusion-framework-module-app';

export { useAppModule } from './useAppModule';
export { useAppModules } from './useAppModules';
export { useAppEnvironmentVariables } from './useAppEnvironmentVariables';

export { makeComponent, ComponentRenderArgs } from './make-component';

export { createLegacyApp } from './create-legacy-app';

export { createComponent } from './create-component';
export { renderApp } from './render-app';
export { renderComponent } from './render-component';

export type { ComponentRenderer } from './create-component';
export type { RenderTeardown } from './render-component';

export { default } from './render-app';

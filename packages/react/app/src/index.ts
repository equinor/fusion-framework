/**
 * @packageDocumentation
 *
 * React bindings for building Fusion Framework applications.
 *
 * Provides the main entry-point helpers (`renderApp`, `createComponent`, `makeComponent`)
 * plus React hooks for accessing framework modules (HTTP, auth, context, navigation, etc.)
 * from within a Fusion app.
 *
 * @remarks
 * This is the primary package application developers depend on when building
 * React-based Fusion apps. It re-exports core types from `@equinor/fusion-framework-app`
 * and adds React-specific rendering, hooks, and sub-path entry-points for optional
 * modules such as MSAL, feature flags, bookmarks, analytics, and settings.
 */

export type {
  AppConfig,
  AppEnv,
  AppModuleInitiator,
  AppModules,
  AppModulesInstance,
  AppRenderFn,
  IAppConfigurator,
} from '@equinor/fusion-framework-app';

export type { Fusion } from '@equinor/fusion-framework-react';

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

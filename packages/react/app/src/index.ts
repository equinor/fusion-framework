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

export { useAppModule } from './useAppModule.js';
export { useAppModules } from './useAppModules.js';
export { useAppEnvironmentVariables } from './useAppEnvironmentVariables.js';

export { makeComponent, ComponentRenderArgs } from './make-component.js';

export { createLegacyApp } from './create-legacy-app.js';

export { createComponent } from './create-component.js';
export { renderApp } from './render-app.js';
export { renderComponent } from './render-component.js';

export type { ComponentRenderer } from './create-component.js';
export type { RenderTeardown } from './render-component.js';

export { default } from './render-app.js';

/**
 * Application React hooks.
 *
 * @remarks
 * Available via the `@equinor/fusion-framework-react/app` sub-entry-point.
 * Provides hooks and types for querying application manifests, observing
 * the currently active app, and accessing app-level modules.
 *
 * @module
 */
export type { AppConfig, AppManifest, AppType, IApp } from '@equinor/fusion-framework-module-app';

export { useCurrentApp } from './useCurrentApp.js';
export { useCurrentAppModule } from './useCurrentAppModule.js';
export { useCurrentAppModules } from './useCurrentAppModules.js';
export { useApps } from './useApps.js';
export { useAppProvider } from './useAppProvider.js';

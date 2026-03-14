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

export { useCurrentApp } from './useCurrentApp';
export { useCurrentAppModule } from './useCurrentAppModule';
export { useCurrentAppModules } from './useCurrentAppModules';
export { useApps } from './useApps';
export { useAppProvider } from './useAppProvider';

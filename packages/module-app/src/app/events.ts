import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { App } from './App';

import type { AppConfig, AppManifest, AppModulesInstance } from '../types';

export interface AppEventEventInit<TDetail extends Record<string, unknown> | unknown = unknown>
    extends FrameworkEventInit<TDetail & { appKey: string }, App> {}

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        onAppModulesLoaded: FrameworkEvent<
            AppEventEventInit<{
                modules: AppModulesInstance;
            }>
        >;

        onAppManifestLoaded: FrameworkEvent<
            AppEventEventInit<{
                manifest: AppManifest;
            }>
        >;

        onAppConfigLoaded: FrameworkEvent<
            AppEventEventInit<{
                config: AppConfig;
            }>
        >;

        onAppScriptLoaded: FrameworkEvent<
            AppEventEventInit<{
                manifest: AppManifest;
            }>
        >;

        onAppDispose: FrameworkEvent<AppEventEventInit>;

        onAppInitialize: FrameworkEvent<AppEventEventInit>;

        onAppInitialized: FrameworkEvent<AppEventEventInit>;

        onAppInitializeFailed: FrameworkEvent<
            AppEventEventInit<{
                error: unknown;
            }>
        >;
    }
}

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { App } from './App';

import type { AppConfig, AppManifest, AppModulesInstance } from '../types';

/** base event type for applications */
export type AppEventEventInit<TDetail extends Record<string, unknown> | unknown = unknown> =
    FrameworkEventInit<
        /** additional event details and key of target event */
        TDetail & { appKey: string },
        /** source of the event */
        App
    >;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** fired when the application has initiated its modules */
        onAppModulesLoaded: FrameworkEvent<
            AppEventEventInit<{
                /** initiated modules for application */
                modules: AppModulesInstance;
            }>
        >;

        /** fired when the application has loaded corresponding manifest */
        onAppManifestLoaded: FrameworkEvent<
            AppEventEventInit<{
                manifest: AppManifest;
            }>
        >;

        /** fired when the application has loaded corresponding config */
        onAppConfigLoaded: FrameworkEvent<
            AppEventEventInit<{
                config: AppConfig;
            }>
        >;

        /** fired when the application has loaded corresponding javascript module */
        onAppScriptLoaded: FrameworkEvent<
            AppEventEventInit<{
                manifest: AppManifest;
            }>
        >;

        /** fired before application loads manifest, config and script */
        onAppInitialize: FrameworkEvent<AppEventEventInit>;

        /**
         * fired after application has loaded manifest, config and script
         *
         * __note:__ not fired until all loaders has settled (last emit)
         */
        onAppInitialized: FrameworkEvent<AppEventEventInit>;

        /** fired when application fails to load either manifest, config and script */
        onAppInitializeFailed: FrameworkEvent<
            AppEventEventInit<{
                error: unknown;
            }>
        >;

        /** fired when the application is disposed (unmounts) */
        onAppDispose: FrameworkEvent<AppEventEventInit>;
    }
}

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { App } from './App';

import type { AppConfig, AppManifest, AppModulesInstance, AppScriptModule } from '../types';

/** base event type for applications */
export type AppEventEventInit<TDetail extends Record<string, unknown> | unknown = unknown> =
    FrameworkEventInit<
        /** additional event details and key of target event */
        TDetail & { appKey: string },
        /** source of the event */
        App
    >;

export type AppEvent<TDetail extends Record<string, unknown> | unknown = unknown> = FrameworkEvent<
    AppEventEventInit<TDetail>
>;

export type AppEventFailure = FrameworkEvent<
    AppEventEventInit<{
        error: AppConfig;
    }>
>;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** fired when the application has initiated its modules */
        onAppModulesLoaded: AppEvent<{
            /** initiated modules for application */
            modules: AppModulesInstance;
        }>;

        onAppManifestLoad: AppEvent;
        /** fired when the application has loaded corresponding manifest */
        onAppManifestLoaded: AppEvent<{
            manifest: AppManifest;
        }>;
        onAppManifestFailure: AppEventFailure;

        onAppConfigLoad: AppEvent;
        /** fired when the application has loaded corresponding config */
        onAppConfigLoaded: AppEvent<{
            config: AppConfig;
        }>;
        onAppConfigFailure: AppEventFailure;

        /** fired when the application has loaded corresponding javascript module */
        onAppScriptLoad: AppEvent;
        onAppScriptLoaded: AppEvent<{
            script: AppScriptModule;
        }>;
        onAppScriptFailure: AppEventFailure;

        /** fired before application loads manifest, config and script */
        onAppInitialize: AppEvent;

        /**
         * fired after application has loaded manifest, config and script
         *
         * __note:__ not fired until all loaders has settled (last emit)
         */
        onAppInitialized: AppEvent;

        /** fired when application fails to load either manifest, config and script */
        onAppInitializeFailure: AppEventFailure;

        /** fired when the application is disposed (unmounts) */
        onAppDispose: FrameworkEvent<AppEventEventInit>;
    }
}

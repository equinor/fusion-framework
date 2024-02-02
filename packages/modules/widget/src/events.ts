import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { Widget } from './Widget';

import type {
    WidgetConfig,
    WidgetManifest,
    WidgetModulesInstance,
    WidgetScriptModule,
} from './types';

/** base event type for applications */
export type WidgetEventInit<TDetail extends Record<string, unknown> | unknown = unknown> =
    FrameworkEventInit<
        /** additional event details and key of target event */
        TDetail & { name: string },
        /** source of the event */
        Widget
    >;

export type WidgetEvent<TDetail extends Record<string, unknown> | unknown = unknown> =
    FrameworkEvent<WidgetEventInit<TDetail>>;

export type WidgetEventFailure = FrameworkEvent<
    WidgetEventInit<{
        error: WidgetConfig;
    }>
>;

declare module '@equinor/fusion-framework-module-event' {
    interface FrameworkEventMap {
        /** fired when the application has initiated its modules */
        onWidgetModulesLoaded: WidgetEvent<{
            /** initiated modules for application */
            modules: WidgetModulesInstance;
        }>;

        onWidgetManifestLoad: WidgetEvent;
        /** fired when the application has loaded corresponding manifest */
        onWidgetManifestLoaded: WidgetEvent<{
            manifest: WidgetManifest;
        }>;
        onWidgetManifestFailure: WidgetEventFailure;

        onWidgetConfigLoad: WidgetEvent;
        /** fired when the application has loaded corresponding config */
        onWidgetConfigLoaded: WidgetEvent<{
            config: WidgetConfig;
        }>;
        onWidgetConfigFailure: WidgetEventFailure;

        /** fired when the application has loaded corresponding javascript module */
        onAWidgetScriptLoad: WidgetEvent;
        onWidgetScriptLoaded: WidgetEvent<{
            script: WidgetScriptModule;
        }>;
        onWidgetScriptFailure: WidgetEventFailure;

        /** fired before application loads manifest, config and script */
        onWidgetInitialize: WidgetEvent;

        /**
         * fired after application has loaded manifest, config and script
         *
         * __note:__ not fired until all loaders has settled (last emit)
         */
        onWidgetInitialized: WidgetEvent;

        /** fired when application fails to load either manifest, config and script */
        onWidgetInitializeFailure: WidgetEventFailure;

        /** fired when the application is disposed (unmounts) */
        onWidgetDispose: FrameworkEvent<WidgetEventInit>;
    }
}

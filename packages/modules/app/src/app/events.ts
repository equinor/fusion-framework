import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { App } from './App';

import type {
  AppConfig,
  AppManifest,
  AppModulesInstance,
  AppScriptModule,
  AppSettings,
} from '../types';

/**
 * Base event initialization type for application lifecycle events.
 *
 * Extends {@link FrameworkEventInit} with a mandatory `appKey` field and
 * the {@link App} as the event source.
 *
 * @template TDetail - Additional detail properties carried by the event.
 */
export type AppEventEventInit<TDetail extends Record<string, unknown> | unknown = unknown> =
  FrameworkEventInit<
    /** additional event details and key of target event */
    TDetail & { appKey: string },
    /** source of the event */
    App
  >;

/**
 * Framework event carrying application-scoped detail and an {@link App} source.
 *
 * @template TDetail - Additional detail properties carried by the event.
 */
export type AppEvent<TDetail extends Record<string, unknown> | unknown = unknown> = FrameworkEvent<
  AppEventEventInit<TDetail>
>;

/**
 * Framework event emitted when an application lifecycle operation fails.
 * The `error` detail carries the underlying failure.
 */
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
      appKey: string;
      manifest: AppManifest;
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

    onAppSettingsLoad: AppEvent;
    /** fired when the application has loaded corresponding settings */
    onAppSettingsLoaded: AppEvent<{
      settings: AppSettings;
    }>;
    onAppSettingsFailure: AppEventFailure;

    onAppSettingsUpdate: AppEvent;
    onAppSettingsUpdated: AppEvent<{
      settings: AppSettings;
    }>;
    onAppSettingsUpdateFailure: AppEventFailure;

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

import type { FrameworkEvent, FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { Widget } from './Widget';

import type {
  WidgetConfig,
  WidgetManifest,
  WidgetModulesInstance,
  WidgetScriptModule,
} from './types';

/**
 * Base event-init shape for all widget lifecycle events.
 *
 * Extends `FrameworkEventInit` with a mandatory `name` field identifying
 * the widget, and sets the event `source` to the originating {@link Widget}
 * instance.
 *
 * @template TDetail - Additional detail properties merged with `{ name: string }`.
 */
export type WidgetEventInit<TDetail extends Record<string, unknown> | unknown = unknown> =
  FrameworkEventInit<TDetail & { name: string }, Widget>;

/**
 * Concrete framework-event type for widget lifecycle events.
 *
 * @template TDetail - Additional detail properties.
 */
export type WidgetEvent<TDetail extends Record<string, unknown> | unknown = unknown> =
  FrameworkEvent<WidgetEventInit<TDetail>>;

/**
 * Framework-event type for widget lifecycle failure events.
 *
 * Carries an `error` property in the event detail for error inspection.
 */
export type WidgetEventFailure = FrameworkEvent<
  WidgetEventInit<{
    error: WidgetConfig;
  }>
>;

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Fired when a widget has finished initializing its framework modules. */
    onWidgetModulesLoaded: WidgetEvent<{
      /** The initialized module instances. */
      modules: WidgetModulesInstance;
    }>;

    /** Fired when a widget manifest fetch starts. */
    onWidgetManifestLoad: WidgetEvent;
    /** Fired when a widget manifest has been successfully loaded. */
    onWidgetManifestLoaded: WidgetEvent<{
      manifest: WidgetManifest;
    }>;
    /** Fired when a widget manifest fetch fails. */
    onWidgetManifestFailure: WidgetEventFailure;

    /** Fired when a widget config fetch starts. */
    onWidgetConfigLoad: WidgetEvent;
    /** Fired when a widget config has been successfully loaded. */
    onWidgetConfigLoaded: WidgetEvent<{
      config: WidgetConfig;
    }>;
    /** Fired when a widget config fetch fails. */
    onWidgetConfigFailure: WidgetEventFailure;

    /** Fired when a widget script import starts. */
    onAWidgetScriptLoad: WidgetEvent;
    /** Fired when a widget script has been successfully imported. */
    onWidgetScriptLoaded: WidgetEvent<{
      script: WidgetScriptModule;
    }>;
    /** Fired when a widget script import fails. */
    onWidgetScriptFailure: WidgetEventFailure;

    /** Fired before the widget begins loading manifest, config, and script. */
    onWidgetInitialize: WidgetEvent;

    /**
     * Fired after the widget has loaded manifest, config, and script.
     *
     * Not emitted until all loaders have settled (last emission).
     */
    onWidgetInitialized: WidgetEvent;

    /** Fired when the widget fails to load manifest, config, or script. */
    onWidgetInitializeFailure: WidgetEventFailure;

    /** Fired when the widget is disposed (unmounted from the DOM). */
    onWidgetDispose: FrameworkEvent<WidgetEventInit>;
  }
}

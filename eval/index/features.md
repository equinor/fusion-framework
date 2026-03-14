# Features

Ensure results reference `@equinor/fusion-framework-module-bookmark`, `@equinor/fusion-framework-module-navigation`, `@equinor/fusion-framework-module-app`, `@equinor/fusion-framework-module-telemetry`, or `@equinor/fusion-framework-module-analytics`.
Verify that configuration helpers, provider methods, and event names are real exports from these packages.
Reject results that confuse React hook wrappers with the underlying module APIs.

## How to save and restore application state with bookmarks

- must mention `enableBookmark` from `@equinor/fusion-framework-module-bookmark` for module registration
- must mention `createBookmark` or `createBookmarkAsync` on `BookmarkProvider` for persisting state
- must mention `setCurrentBookmark` for activating a saved bookmark by ID
- should mention `addPayloadGenerator` for attaching side-effect payload transformers
- should mention `currentBookmark$` observable for streaming the active bookmark

## How to register and navigate between apps in Fusion Framework

- must mention `enableNavigation` from `@equinor/fusion-framework-module-navigation`
- must mention `push` and `replace` on `NavigationProvider` for programmatic navigation
- must mention `createRouter` for creating a `@remix-run/router` instance from routes
- should mention `BrowserHistory`, `MemoryHistory` as history type options
- should mention `history.block` for navigation blocking with cancel/retry

## How to manage app manifests and lifecycle

- must mention `enableAppModule` from `@equinor/fusion-framework-module-app`
- must mention `setCurrentApp` on `AppModuleProvider` for loading and activating an app
- must mention `getAppManifest` or `getAppManifests` for fetching app manifests
- should mention `getAppConfig` for retrieving app environment and endpoints
- should mention error classes like `AppManifestError` or `AppConfigError` for typed failures

## How to track events and emit telemetry in Fusion Framework

- must mention `enableTelemetry` from `@equinor/fusion-framework-module-telemetry`
- must mention `trackEvent` or `trackException` on the telemetry provider
- must mention `measure` for creating performance measurements
- should mention `ApplicationInsightsAdapter` from the `/application-insights-adapter` sub-path
- should mention `TelemetryLevel` enum for severity filtering

## How to collect analytics events in a Fusion app

- must mention `enableAnalytics` from `@equinor/fusion-framework-module-analytics`
- must mention `FusionAnalyticsAdapter` from the `/adapters` sub-path for forwarding to OpenTelemetry
- must mention collector classes like `ContextSelectedCollector` or `AppSelectedCollector` from `/collectors`
- should mention `ConsoleAnalyticsAdapter` for debug logging
- should mention `OTLPLogExporter` from `/logExporters` for direct HTTP export

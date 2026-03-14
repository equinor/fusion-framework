# Features

These queries cover opt-in Fusion modules that extend the base framework with
application-level capabilities: bookmarks, navigation, app loading, and
observability. Each module follows the `enableX(configurator)` registration
pattern and exposes a provider with both observable and async APIs.

When judging results, verify that:
- The result explains the **registration step** (`enableX`) separately from the
  **runtime API** (provider methods, observables, events). A good result shows
  both; a result that only lists provider methods without showing how to register
  the module is incomplete.
- Provider methods and event names are **real exports** — not invented or
  confused with React hook wrappers from `@equinor/fusion-framework-react-app`.
- Observable streams (`*$` properties) and async alternatives (`*Async` methods)
  are distinguished correctly — they are not interchangeable.
- Results stay within the module boundary. Navigation results should not bleed
  into React Router specifics; bookmark results should not describe the React
  `useCurrentBookmark` hook unless asked.

## How to persist and restore shareable application state with bookmarks

- must mention `enableBookmark` from `@equinor/fusion-framework-module-bookmark` for module registration
- must mention `createBookmark` or `createBookmarkAsync` on `BookmarkProvider` for saving state
- must mention `setCurrentBookmark(id)` for activating a saved bookmark
- should mention `addPayloadGenerator` for letting modules inject extra state into the bookmark payload
- should mention `currentBookmark$` observable for reacting to bookmark changes

## How to configure client-side navigation and routing in Fusion Framework

- must mention `enableNavigation` from `@equinor/fusion-framework-module-navigation` for registration
- must mention `push` and `replace` on `NavigationProvider` for programmatic navigation
- must show how the navigation module integrates with `@remix-run/router` via `createRouter`
- should mention history types (`'browser'`, `'hash'`, `'memory'`) and when to use each
- should mention `history.block` for preventing navigation with a cancel/retry callback

## How to load and manage micro-frontend apps at runtime

- must mention `enableAppModule` from `@equinor/fusion-framework-module-app` for registration
- must mention `setCurrentApp(appKey)` for loading an app by its key
- must mention `getAppManifest` or `getAppManifests` for fetching app metadata
- should mention `getAppConfig` for retrieving an app's environment config and named endpoints
- should mention typed error classes (`AppManifestError`, `AppConfigError`) for handling app load failures

## How to instrument a Fusion app with telemetry and performance tracking

- must mention `enableTelemetry` from `@equinor/fusion-framework-module-telemetry` for registration
- must mention `trackEvent` and `trackException` on the telemetry provider for emitting items
- must mention `measure` for creating scoped performance measurements that auto-report duration
- should mention `ApplicationInsightsAdapter` for forwarding telemetry to Azure Application Insights
- should mention `TelemetryLevel` enum (`Verbose` through `Critical`) for severity filtering

## How to collect structured analytics events in a Fusion app

- must mention `enableAnalytics` from `@equinor/fusion-framework-module-analytics` for registration
- must mention adapter pattern — `FusionAnalyticsAdapter` or `ConsoleAnalyticsAdapter` from `/adapters`
- must mention built-in collectors like `ContextSelectedCollector` or `AppSelectedCollector` from `/collectors`
- should mention `OTLPLogExporter` from `/logExporters` for direct HTTP export to an OTLP endpoint
- should mention `BaseCollector` as the base class for writing custom collectors

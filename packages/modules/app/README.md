# @equinor/fusion-framework-module-app

Framework module for loading, configuring, and managing Fusion applications at runtime.

Primarily used by **portal hosts** and other framework initiators that need to discover, load, and switch between applications dynamically. The module handles manifest fetching, build resolution, configuration loading, per-user app settings, and script import of application bundles.

## When to Use

- You are building a portal or shell that hosts multiple Fusion applications.
- You need to fetch application manifests and configurations from the Fusion app service.
- You need to dynamically import an application's JavaScript bundle at runtime.
- You need to read or write per-user application settings.

> [!NOTE]
> By design this module only allows **one active application** at a time (`currentApp`).
> If you need multiple concurrent app instances, use the Widgets module instead.

## Quick Start

Enable the module in your framework configurator:

```ts
import { enableAppModule } from '@equinor/fusion-framework-module-app';

export const configure = async (configurator: FrameworkConfigurator) => {
  enableAppModule(configurator);
};
```

Once enabled, the `AppModuleProvider` is available on the framework instance:

```ts
const appProvider = framework.modules.app;

// Set the current application by key
appProvider.setCurrentApp('my-app');

// React to current app changes
appProvider.current$.subscribe((app) => {
  if (app) {
    console.log('Current app:', app.appKey);
  }
});
```

## Core Concepts

### AppModuleProvider

The main runtime entry point. Provides methods to:

- **Fetch manifests** – `getAppManifest(appKey)` and `getAppManifests()` return observable streams of `AppManifest` objects.
- **Fetch configuration** – `getAppConfig(appKey)` returns the app's environment and endpoint configuration.
- **Manage settings** – `getAppSettings(appKey)` and `updateAppSettings(appKey, settings)` read and write per-user settings.
- **Set/clear current app** – `setCurrentApp(appKey)` creates an `App` instance and emits it on `current$`. `clearCurrentApp()` disposes the current app.

### App

Represents a single loaded application. Manages internal state for the manifest, config, settings, and imported script module via a reactive state machine (`FlowSubject`). Key observables:

| Observable    | Emits                                |
|---------------|--------------------------------------|
| `manifest$`   | `AppManifest` when resolved          |
| `config$`     | `AppConfig` when resolved            |
| `settings$`   | `AppSettings` (fetched on subscribe) |
| `modules$`    | Imported `AppScriptModule`           |
| `instance$`   | Initialized `AppModulesInstance`      |
| `status$`     | Set of in-progress action types      |

Call `app.initialize()` to load manifest, config, and script in parallel and receive them as a combined observable.

### AppClient

Low-level HTTP client that communicates with the Fusion app service API. Handles caching (via `Query`), response parsing (via Zod schemas), and error mapping to typed error classes (`AppManifestError`, `AppConfigError`, `AppBuildError`, `AppSettingsError`).

### AppConfig

Immutable, deeply frozen configuration object with `environment` (arbitrary key-value data) and `endpoints` (named URLs with OAuth scopes). Use `config.getEndpoint('api')` to retrieve a specific endpoint.

### AppConfigurator

Configuration builder used during module initialization. Allows overriding the default HTTP client and asset URI:

```ts
enableAppModule(configurator, (builder) => {
  builder.setClient(async (args) => {
    const http = await args.requireInstance('http');
    return new AppClient(http.createClient('my-custom-apps'));
  });
  builder.setAssetUri('/custom-proxy');
});
```

## Events

When the `EventModule` is available, the app module dispatches lifecycle events on manifest, config, settings, and script loading. Key events include:

- `onCurrentAppChanged` – fired when `setCurrentApp` or `clearCurrentApp` is called
- `onAppManifestLoad` / `onAppManifestLoaded` / `onAppManifestFailure`
- `onAppConfigLoad` / `onAppConfigLoaded` / `onAppConfigFailure`
- `onAppSettingsLoad` / `onAppSettingsLoaded` / `onAppSettingsFailure`
- `onAppScriptLoad` / `onAppScriptLoaded` / `onAppScriptFailure`
- `onAppInitialize` / `onAppInitialized` / `onAppInitializeFailure`
- `onAppDispose`

## Error Handling

All API requests map HTTP status codes to typed error classes:

| Error Class         | When Thrown                          |
|---------------------|--------------------------------------|
| `AppManifestError`  | Manifest fetch fails (404, 401, 410) |
| `AppConfigError`    | Config fetch fails                   |
| `AppBuildError`     | Build metadata fetch fails           |
| `AppSettingsError`  | Settings fetch or update fails       |
| `AppScriptModuleError` | Script import fails               |

Each error includes a `type` property (`'not_found'`, `'unauthorized'`, `'deleted'`, or `'unknown'`) for programmatic handling.

## Main Exports

| Export               | Description                                      |
|----------------------|--------------------------------------------------|
| `enableAppModule`    | Registers the module with a framework configurator |
| `AppModuleProvider`  | Runtime provider with app lifecycle methods       |
| `AppClient`          | Low-level HTTP client for the app service         |
| `AppConfigurator`    | Configuration builder for module setup            |
| `AppConfig`          | Immutable app configuration (env + endpoints)     |
| `App` / `IApp`       | Application instance with reactive state          |
| `AppModule`          | Module definition for the framework               |
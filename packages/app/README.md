---
title: "@equinor/fusion-framework-app"
description: "Application foundation package for the Fusion Framework"
category: "Application"
tag:
  - app
  - core
  - foundation
  - modules
  - framework
  - typescript
---

Configuration and initialization layer for Fusion applications.

Use this package to set up application modules, configure HTTP clients, integrate
with service discovery, enable bookmarks, and wire up telemetry — all with a
single `configureModules` call.

> **Most Fusion apps should use `@equinor/fusion-framework-react-app` instead.**
> This lower-level package is for framework-agnostic or advanced scenarios.

## Documentation

| Topic | Description |
|---|---|
| [Configure HTTP Clients](docs/http-clients.md) | Named clients from app config, service discovery, and explicit registration, plus resolution priority |
| [Enable Bookmarks](docs/bookmarks.md) | Registering the bookmark module via `enableBookmark` |
| [Testing](docs/testing.md) | The `/mock` entry point: `mockAppModules`, `AppMockConfigurator`, and `enableAppManifestMock` |

## Installation

```sh
pnpm add @equinor/fusion-framework-app
```

## Quick Start
```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableState } from '@equinor/fusion-framework-app/enable-state';

const configure: AppModuleInitiator = (configurator) => {
    enableState(configurator);
};
```

> [!CAUTION]
> The state management module is a powerful tool, but it's important to know the potential pitfalls and limitations when using it in your application. The state management is global and can lead to unexpected behavior if not used carefully.
>
> __example 1:__ If you have multiple components that rely on the same state, updating the state in one component can cause re-renders in all components that use that state, potentially leading to performance issues.
>
> __example 2:__ The user has open multiple tabs of the application, and each tab is modifying the same state. This can lead to unexpected behavior, as changes made in one tab will be reflected to all tabs. (like storing user preferences for selected columns)

#### Bookmarks

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fbookmark%2Fpackage.json&label=@equinor/fusion-framework-module-bookmark&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/bookmark)

_The bookmark module provides a way to save and restore the state of the application. This is useful for saving the state of the application when the user navigates away from the application and then returns to the application._

```sh
# Install the bookmark module
pnpm add @equinor/fusion-framework-module-bookmark
```

```ts
import { configureModules } from '@equinor/fusion-framework-app';

// Create an initializer with custom configuration
const initialize = configureModules((configurator, { fusion, env }) => {
  // Register a named HTTP client
  configurator.configureHttpClient('myApi', {
    baseUri: 'https://api.example.com',
    defaultScopes: ['api://client-id/.default'],
  });
});

// Bootstrap the application
const modules = await initialize({ fusion, env });
```

## Key Concepts

| Concept | Description |
|---|---|
| `configureModules` | Factory function that creates an async initializer for application modules. |
| `AppConfigurator` | Internal configurator created by `configureModules`; registers default modules (`event`, `http`, `msal`) and reads endpoint config. |
| `IAppConfigurator` | Public interface for the configurator, used when typing configuration callbacks. |
| `AppModuleInitiator` | Callback signature accepted by `configureModules` for user-supplied setup. |
| `AppEnv` | Environment descriptor containing the app manifest, config, and optional basename. |
| `enableBookmark` | Helper to enable the bookmark module (import from `@equinor/fusion-framework-app/enable-bookmark`). |
| `mockAppModules` | Runs the real module pipeline against deterministic fakes for tests (import from `@equinor/fusion-framework-app/mock`). |

## API Surface

### `configureModules(cb?)`

Returns an async initializer `(args: { fusion, env }) => Promise<AppModulesInstance>`.

The optional callback receives an `IAppConfigurator` and the Fusion/env args,
giving you access to:

- **`configurator.configureHttpClient(name, options)`** — register a named HTTP client with explicit base URI and scopes.
- **`configurator.configureHttp(...)`** — low-level HTTP module configuration.
- **`configurator.useFrameworkServiceClient(serviceName, options?)`** — register a client resolved via Fusion service discovery.

### Sub-path Exports

| Export path | What it provides |
|---|---|
| `@equinor/fusion-framework-app` | `configureModules`, `AppConfigurator`, `IAppConfigurator`, all type aliases |
| `@equinor/fusion-framework-app/enable-bookmark` | `enableBookmark` function |
| `@equinor/fusion-framework-app/mock` | `mockAppModules`, `AppMockConfigurator`, `enableAppManifestMock` |

## Configure HTTP Clients

The `AppConfigurator` can register named HTTP clients from several sources —
application config endpoints, service discovery, or explicit registration —
and you retrieve one at runtime with `framework.modules.http.createClient(name)`.

```ts
const initialize = configureModules((configurator) => {
  configurator.useFrameworkServiceClient('people');
});
```

See [Configure HTTP Clients](docs/http-clients.md) for auto-registration from
`app.config.ts`, explicit registration, and resolution priority when a client
is configured in more than one place.

## Enable Bookmarks

The bookmark module allows applications to save and restore application state.

> **Important:** Import `enableBookmark` from the app-level package, not from
> `@equinor/fusion-framework-module-bookmark` directly.

```ts
import { enableBookmark } from '@equinor/fusion-framework-app/enable-bookmark';

const initialize = configureModules((configurator) => {
  enableBookmark(configurator);
});
```

See [Enable Bookmarks](docs/bookmarks.md) for payload generator cleanup behavior.

## Testing

Import from `@equinor/fusion-framework-app/mock` to run an application's real
module pipeline in tests — the real `event`/`http`/`msal` modules, the real
`AppConfigurator` configuration pipeline, and real lifecycle — while only the
boundaries that reach outside the process are substituted with deterministic
fakes. This entry point has no dependency on Vitest or any other test runner.

```ts
import { mockAppModules } from '@equinor/fusion-framework-app/mock';

const manifest = { appKey: 'my-app', displayName: 'My App', description: 'My app', type: 'standalone' } as const;
const modules = await mockAppModules(undefined, { manifest });
```

See [Testing](docs/testing.md) for `AppMockConfigurator`, `enableAppManifestMock`,
and customizing the mocked parent's service discovery.

## Types

| Type | Purpose |
|---|---|
| `AppEnv` | Environment descriptor (manifest, config, basename, props) |
| `AppModuleInitiator` | Configuration callback signature for `configureModules` |
| `AppModuleInit` | Full factory type wrapping `AppModuleInitiator` |
| `AppModuleInitArgs` | Arguments passed to the returned initializer |
| `AppRenderFn` | Render function for mounting an app into a DOM element |
| `AppManifest` | Application manifest metadata (re-export) |
| `AppConfig` | Environment-specific config (re-export) |
| `AppModules` | Union of default application modules (re-export) |
| `AppModulesInstance` | Resolved module instances after initialization (re-export) |

## Further Reading

- [Fusion Framework documentation](https://equinor.github.io/fusion-framework/)
- [`@equinor/fusion-framework-react-app`](../react/app/) — React wrapper with hooks and providers


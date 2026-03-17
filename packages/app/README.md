# @equinor/fusion-framework-app

Configuration and initialization layer for Fusion applications.

Use this package to set up application modules, configure HTTP clients, integrate
with service discovery, enable bookmarks, and wire up telemetry — all with a
single `configureModules` call.

> **Most Fusion apps should use `@equinor/fusion-framework-react-app` instead.**
> This lower-level package is for framework-agnostic or advanced scenarios.

## Installation

```sh
pnpm add @equinor/fusion-framework-app
```

## Quick Start

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

## Configure HTTP Clients

The `AppConfigurator` can register named HTTP clients from several sources.
You retrieve a client at runtime with `framework.modules.http.createClient(name)`.

### From Application Config (auto-registration)

Endpoints defined in `app.config.<env>.ts` are **automatically registered as
named HTTP clients** when the `AppConfigurator` is created — no extra code
needed in `config.ts`.

```ts
// app.config.ts
import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

export default defineAppConfig(() => ({
  endpoints: {
    schedule: {
      url: 'https://schedule-api.example.com',
      scopes: ['api://schedule-id/.default'],
    },
  },
}));
```

After initialization, use the client directly:

```ts
const client = framework.modules.http.createClient('schedule');
const data = await client.json('/items');
```

### Via Service Discovery

```ts
const initialize = configureModules((configurator) => {
  configurator.useFrameworkServiceClient('people');
});
```

### Explicit Registration

Use `configureHttpClient` in `config.ts` when the endpoint is **not** in
`app.config.ts`, or when you need custom transport behavior such as headers,
response guards, or a custom client class.

```ts
configurator.configureHttpClient('custom-api', {
  baseUri: 'https://custom.api.example.com',
  defaultScopes: ['api://custom-id/.default'],
  onCreate: (client) => {
    client.requestHandler.setHeader('X-Source', 'portal');
  },
});
```

### Resolution Priority

When the same client name is configured in more than one place, the
highest-priority source wins:

| Priority | Source | Example |
|----------|--------|---------|
| 1 (highest) | **Session overrides** | User-specific URL / scopes set at runtime via `sessionStorage` |
| 2 | **Application config endpoints** | `endpoints` in `app.config.ts` |
| 3 | **Service-discovery registry** | Resolved via `useFrameworkServiceClient` |
| 4 (lowest) | **Explicit registration** | `configureHttpClient(name, options)` in `config.ts` |

This means an endpoint defined in `app.config.ts` will override a
`configureHttpClient` call for the same name, and a session override will
override both.

## Enable Bookmarks

The bookmark module allows applications to save and restore application state.

> **Important:** Import `enableBookmark` from the app-level package, not from
> `@equinor/fusion-framework-module-bookmark` directly.

```ts
import { configureModules } from '@equinor/fusion-framework-app';
import { enableBookmark } from '@equinor/fusion-framework-app/enable-bookmark';

const initialize = configureModules((configurator) => {
  enableBookmark(configurator);
});
```

Payload generators registered through the bookmark module are automatically
cleaned up when the module is disposed.

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


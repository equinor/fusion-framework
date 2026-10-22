# @equinor/fusion-framework-widget

Configure and initialize Fusion Framework modules for widgets.

`@equinor/fusion-framework-widget` is the standard entry point for widget authors building on the Fusion platform. It provides a thin configuration layer over the core module system, pre-registering the **event**, **HTTP**, and **MSAL auth** modules and exposing convenience helpers for service-discovery bindings and named HTTP clients.

## Who Should Use This Package

Use this package when you are building a **Fusion widget** — a self-contained UI component loaded by the Fusion portal at runtime. If you are building a full Fusion **application** instead, use `@equinor/fusion-framework-react-app`.

## Quick Start

Install the package and its peer dependency:

```sh
pnpm add @equinor/fusion-framework-widget
```

Create a module initializer and export it as the widget's default export:

```ts
import { configureWidgetModules } from '@equinor/fusion-framework-widget';

export default configureWidgetModules((configurator, { env }) => {
  // Set up MSAL authentication
  configurator.configureMsal({
    tenantId: '{TENANT_ID}',
    clientId: '{CLIENT_ID}',
    redirectUri: '/authentication/login-callback',
  });

  // Register a named HTTP client
  configurator.configureHttpClient('myApi', {
    baseUri: 'https://api.example.com',
    defaultScopes: ['api://my-client-id/.default'],
  });
});
```

The Fusion portal calls the returned async function at render time, passing the current runtime and widget environment.

## Key Concepts

| Concept | Description |
| --- | --- |
| **Widget** | A self-contained UI component loaded and rendered by the Fusion portal. |
| **WidgetConfigurator** | Pre-registers core modules (event, HTTP, auth) and exposes helpers for common setup tasks. |
| **configureWidgetModules** | Factory that accepts a configuration callback and returns an async initializer the portal invokes at render time. |
| **WidgetEnv** | Environment object containing the widget manifest and optional consumer props. |
| **WidgetModuleInitiator** | Callback type passed to `configureWidgetModules` for registering modules. |

## Exported API

| Export | Kind | Description |
| --- | --- | --- |
| `configureWidgetModules` | function | Create a widget module initializer from a configuration callback. |
| `WidgetConfigurator` | class | Default `IWidgetConfigurator` implementation with pre-registered core modules. |
| `IWidgetConfigurator` | interface | Configuration contract exposing `configureHttp`, `configureHttpClient`, `configureMsal`, and `useFrameworkServiceClient`. |
| `WidgetEnv` | type | Widget environment shape (manifest, config, props). |
| `WidgetModuleInitiator` | type | Callback signature for the configuration function. |
| `WidgetModuleInit` | type | Full initializer function signature (callback → async init). |
| `WidgetManifest` | re-export | Widget identity, version, and asset metadata (from `@equinor/fusion-framework-module-widget`). |
| `WidgetModules` | re-export | Combined module type for event + service-discovery + custom modules. |
| `WidgetModulesInstance` | re-export | Initialized runtime instance of `WidgetModules`. |

## Configure Service-Discovery HTTP Clients

Use `useFrameworkServiceClient` when the API base URL is managed by the Fusion portal's service-discovery catalogue:

```ts
export default configureWidgetModules((configurator) => {
  configurator.useFrameworkServiceClient('context');
});
```

At initialization time the service URI and auth scopes are resolved automatically from the parent Fusion runtime.

## Register Custom Modules

Pass additional modules through the generic parameter and call `configure` on the configurator:

```ts
import { configureWidgetModules } from '@equinor/fusion-framework-widget';
import myModule from './my-module';

export default configureWidgetModules<[typeof myModule]>((configurator) => {
  configurator.configure(myModule);
});
```

## Related Packages

- [`@equinor/fusion-framework-module-widget`](../modules/widget) — Low-level widget module, types, and manifest definitions.
- [`@equinor/fusion-framework-module-http`](../modules/http) — HTTP client module used under the hood.
- [`@equinor/fusion-framework-module-msal`](../modules/msal) — MSAL authentication module.
- [`@equinor/fusion-framework`](../framework) — Core Fusion runtime.

## Documentation

See the full Fusion Framework documentation at <https://equinor.github.io/fusion-framework/>.


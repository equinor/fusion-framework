# Configure HTTP Clients

Use HTTP client configuration when your application talks to the same backend more than once and you want one place to define base URLs, MSAL scopes, headers, and transport behavior.

The main configuration APIs are:

- `configureHttpClient(name, options)` for one named client
- `configureHttp(...)` for lower-level module configuration
- `createClient(name)` to create a fresh client instance from a named configuration
- `createCustomClient<T>(name)` to create a custom client class with the same configuration

## Named Clients vs Ad-Hoc Clients

| Use case | API | Why |
| --- | --- | --- |
| One backend used throughout the app | `configureHttpClient(name, options)` | Keeps base URL, scopes, and shared behavior in one place |
| Several clients configured together | `configureHttp(...)` | Useful when a module or setup step owns multiple backends |
| One-off call to a specific base URL | `createClient({ baseUri })` | Useful for inline or temporary configuration |
| One-off call to an absolute URL | `createClient('https://api.example.com')` | Useful when the URL itself is the configuration |

> **Fusion app developers:** Higher-level frameworks like `@equinor/fusion-framework-app` can auto-register named clients from other sources (e.g. application config endpoints or service discovery) before your code runs. See the [`@equinor/fusion-framework-app` README](../../app/README.md) for details on how clients are registered at the app level and which source takes priority.

## Quick Start

```typescript
configurator.configureHttpClient('catalog', {
  baseUri: '/api/catalog',
  defaultScopes: ['api://catalog-api/.default'],
  onCreate: (client) => {
    client.requestHandler.setHeader('X-App-Name', 'portal');
  },
});

const client = framework.modules.http.createClient('catalog');
const items = await client.json('/items');
```

This pattern is the normal entry point for application code.

## Configuration Options

| Option | What it controls |
| --- | --- |
| `baseUri` | Base URL used to resolve request paths. Relative values are resolved against `window.location.origin`. |
| `defaultScopes` | Default MSAL scopes used by `HttpClientMsal` requests. |
| `ctor` | Custom client constructor when you want domain-specific client methods. |
| `onCreate` | Callback that runs for every newly created client instance. |
| `requestHandler` | Initial request handler pipeline cloned into created clients. |
| `responseHandler` | Initial response handler pipeline passed into created clients. |

## Use `onCreate` For Shared Client Behavior

`onCreate` is the main place to attach behavior that every fresh client instance should start with.

```typescript
configurator.configureHttpClient('catalog', {
  baseUri: '/api/catalog',
  onCreate: (client) => {
    client.requestHandler.setHeader('X-Feature', 'catalog');
    client.responseHandler.add('reject-unauthorized', (response) => {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
    });
  },
});
```

Use this for headers, logging, validation, transport guards, and response policies.

## MSAL Scope Behavior

When the auth module is available, the HTTP module can acquire an access token before sending the request.

- `defaultScopes` come from the configured client
- per-request `scopes` are appended to `defaultScopes`
- token acquisition only happens when the final scope list is non-empty

```typescript
await client.json('/items', {
  scopes: ['api://catalog-admin/.default'],
});
```

That request uses both the configured `defaultScopes` and the request-specific scopes.

## Direct Module Integration

If you are configuring modules directly instead of using higher-level framework helpers, use the package exports.

```typescript
import {
  configureHttp,
  configureHttpClient,
} from '@equinor/fusion-framework-module-http';

configurator.addConfig(configureHttpClient('catalog', {
  baseUri: '/api/catalog',
}));

configurator.addConfig(configureHttp((http) => {
  http.configureClient('search', {
    baseUri: '/api/search',
  });
}));
```

Use `configureHttpClient(...)` when you only need one named client. Use `configureHttp(...)` when a module setup step owns several client registrations.

## Ad-Hoc Clients

The provider also supports one-off client creation without a named configuration.

```typescript
const inlineClient = framework.modules.http.createClient({
  baseUri: '/api/search',
});

const urlClient = framework.modules.http.createClient('https://api.example.com');
```

If the string passed to `createClient()` is not a configured key but is an absolute `http:` or `https:` URL, the provider treats it as a `baseUri`.

## Custom Client Classes

Use `ctor` when you want to wrap the shared transport behavior in domain-specific methods.

```typescript
import { HttpClient } from '@equinor/fusion-framework-module-http/client';

class ApiClient extends HttpClient {
  getHealth(): Promise<{ status: string }> {
    return this.json('/health');
  }
}

configurator.configureHttpClient('api', {
  baseUri: '/api',
  ctor: ApiClient,
});

const client = framework.modules.http.createCustomClient<ApiClient>('api');
const health = await client.getHealth();
```

## What `createClient()` Does

Each call to `createClient()` creates a fresh client instance.

- the client starts with its configured `baseUri`
- `defaultScopes` are assigned to the client instance
- `requestHandler` and `responseHandler` configuration is applied to that instance
- `onCreate` runs for that specific instance

This matters because headers and handlers added to one created client do not leak into the next created client from the same named configuration.

## Missing Clients And Safe Lookup

Use `hasClient(name)` when a client configuration may be optional.

```typescript
if (framework.modules.http.hasClient('catalog')) {
  const client = framework.modules.http.createClient('catalog');
  await client.json('/items');
}
```

If you call `createClient(name)` with an unknown key, the provider throws `ClientNotFoundException`.

## Rule Of Thumb

- use named clients for stable backends
- use `onCreate` for shared transport behavior
- use `ctor` when you want domain-specific methods
- use ad-hoc clients only when the configuration is truly local
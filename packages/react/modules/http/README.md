# @equinor/fusion-framework-react-module-http

React integration layer for the Fusion HTTP module. Provides the `useHttpClient` hook for making authenticated HTTP requests from React components.

## What This Package Exports

| Export              | Type     | Description                                                   |
| ------------------- | -------- | ------------------------------------------------------------- |
| `useHttpClient`     | Hook     | Returns a configured `IHttpClient` instance by name           |
| `IHttpClient`       | Type     | HTTP client interface with `fetch`, `json`, `blob` methods    |
| `HttpClientMsal`    | Class    | MSAL-authenticated HTTP client implementation                 |
| `FetchRequestInit`  | Type     | Extended fetch init type with selector support                |
| `HttpResponseError` | Class    | Error thrown for non-ok HTTP responses                        |
| `HttpJsonResponseError` | Class | Error thrown for failed JSON response parsing                |

**Import:**

```ts
import { useHttpClient } from '@equinor/fusion-framework-react-module-http';
```

## When to Use This vs `react-app/http`

| Scenario                                 | Import from                                        |
| ---------------------------------------- | -------------------------------------------------- |
| Building a Fusion app (most common)      | `@equinor/fusion-framework-react-app/http`         |
| Building a reusable library or module    | `@equinor/fusion-framework-react-module-http`      |
| Building a portal or host application    | `@equinor/fusion-framework-react-module-http`      |

The `react-app/http` sub-path re-exports `useHttpClient` from this package. App developers should prefer the `react-app` import for consistency. Use this package directly when building framework-level code, shared libraries, or portal shells.

## useHttpClient

Creates a memoised HTTP client instance from a named configuration. Throws if no client is configured for the given name.

**Signature:**

```ts
function useHttpClient(name: string): IHttpClient;
```

**Example:**

```tsx
import { useHttpClient } from '@equinor/fusion-framework-react-module-http';

const DataFetcher = () => {
  const client = useHttpClient('my-api');
  // client.fetch('/endpoint'), client.json('/data'), etc.
};
```

## Related

- [`@equinor/fusion-framework-module-http`](../../modules/http/README.md) — the underlying HTTP module with full configuration documentation
- [`@equinor/fusion-framework-react-app/http`](../app/docs/http.md) — app-developer-facing wrapper

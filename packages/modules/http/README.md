# Fusion Framework HTTP Module

`@equinor/fusion-framework-module-http` is the HTTP layer for Fusion Framework applications and modules. It gives you a fetch-style client factory with framework-aware configuration, MSAL-aware requests, RxJS observables, and reusable request/response pipelines.

If you only remember one thing about this package, make it this: you configure clients once, and you create fresh client instances when you use them.

If you are new to Fusion Framework or just want to call an API, start with `configureHttpClient(...)`, `createClient(...)`, and `json()`.

If you are building more advanced workflows, this package also supports RxJS observable composition, request and response stream inspection, custom selectors, request and response operators, MSAL-aware requests, and server-sent events.

## What This Package Gives You

- Named HTTP client configurations for each backend you talk to.
- Fresh client instances so headers and handlers from one usage do not leak into the next.
- Promise and Observable APIs on top of the same request pipeline.
- Built-in support for JSON, blobs, and server-sent events.
- Request and response handlers for cross-cutting behavior.
- MSAL scope support when the auth module is available.

## Mental Model

Think of the HTTP module as a client factory, not a singleton HTTP client.

1. Configure a named client during app or module setup.
2. Call `createClient(name)` when you need to make requests.
3. Use `fetch`, `json`, `blob`, or `sse$` on that client instance.
4. Add shared behavior in `onCreate`, `requestHandler`, and `responseHandler`.

Each request goes through the same high-level flow:

1. Resolve `baseUri` and request path into a full URL.
2. Run request handlers.
3. Emit the request on `request$`.
4. Execute the fetch call.
5. Run response handlers.
6. Emit the response on `response$`.
7. Apply an optional selector.

## Start Here If You Are New

The simplest useful path looks like this:

1. Register a named client for one backend.
2. Create a client from that name where you need it.
3. Call `json()` for normal API calls.

That gives you:

- consistent base URLs
- shared auth scope configuration
- shared headers or guards through `onCreate`
- one fresh client instance per usage

If you are unsure whether to use promises or observables, start with `json()`. Move to `json$()` when you need RxJS operators, cancellation by unsubscribe, or stream composition.

## When To Use Which API

| Need | Use |
| --- | --- |
| Call a normal JSON API | `json()` or `json$()` |
| Work with the raw `Response` | `fetch()` or `fetch$()` |
| Download a file or blob response | `blob()` or `blob$()` |
| Consume a streaming `text/event-stream` endpoint | `sse$()` |
| Apply standard headers, scopes, or logging per backend | named client configuration + `onCreate` |

## Install

```bash
pnpm add @equinor/fusion-framework-module-http
```

## Quick Start

Configure a named client during setup:

```typescript
configurator.configureHttpClient('catalog', {
  baseUri: '/api/catalog',
  defaultScopes: ['api://catalog-api/.default'],
  onCreate: (client) => {
    client.requestHandler.setHeader('X-App-Name', 'portal');
  },
});
```

Use the configured client after the framework is initialized:

```typescript
type CatalogItem = {
  id: string;
  title: string;
};

const client = framework.modules.http.createClient('catalog');
const items = await client.json<CatalogItem[]>('/items');
```

What is happening here:

- `catalog` is a named configuration, not a long-lived shared client instance.
- `createClient('catalog')` creates a fresh client with the configured base URI, handlers, and default scopes.
- `json()` runs the request pipeline and returns parsed JSON.

## Public Entry Points

| Entry point | Purpose |
| --- | --- |
| `@equinor/fusion-framework-module-http` | Module definition, configurator/provider helpers, exported errors, and shared client types |
| `@equinor/fusion-framework-module-http/client` | `HttpClient`, `HttpClientMsal`, and client-related types |
| `@equinor/fusion-framework-module-http/operators` | `HttpRequestHandler`, `HttpResponseHandler`, `ProcessOperators`, `capitalizeRequestMethodOperator`, `requestValidationOperator`, `sseMap`, and operator types |
| `@equinor/fusion-framework-module-http/selectors` | `jsonSelector`, `blobSelector`, `createSseSelector`, `ResponseSelector`, and SSE selector types |
| `@equinor/fusion-framework-module-http/errors` | `HttpResponseError`, `HttpJsonResponseError`, and `ServerSentEventResponseError` |

For most teams, the top-level package plus the `selectors` or `operators` subpaths are enough.

## Configuring Clients

Use named clients when you want a stable configuration for a backend: a base URL, default MSAL scopes, shared headers, and request or response policies.

The HTTP module supports three common configuration styles:

- named clients with `configureHttpClient(name, options)`
- lower-level module configuration with `configureHttp(...)`
- ad-hoc clients with `createClient({ baseUri })` or `createClient('https://...')`

MSAL scope behavior is part of client configuration:

- `defaultScopes` belong to the configured client
- per-request `scopes` are appended to `defaultScopes`
- token acquisition only happens when the auth module is available and the final scope list is non-empty

See [Client Configuration](docs/client-configuration.md) for configuration options, `onCreate`, direct module integration, custom client classes, ad-hoc clients, and `ClientNotFoundException` behavior.

## Core API

Each call to `createClient()` returns a fresh instance with its own handler state.

| Method | Returns | Use it when |
| --- | --- | --- |
| `fetch(path, init?)` | `Promise<Response \| T>` | You want the raw `Response`, or you want to provide a custom selector |
| `fetch$(path, init?)` | `Observable<Response \| T>` | You want RxJS composition or cancellation by unsubscribing |
| `json(path, init?)` | `Promise<T>` | You are calling a JSON API |
| `json$(path, init?)` | `Observable<T>` | You want the JSON API call as an observable |
| `blob(path, init?)` | `Promise<BlobResult>` | You are downloading a file or binary payload |
| `blob$(path, init?)` | `Observable<BlobResult>` | You want blob responses in an observable pipeline |
| `sse$(path, init?, options?)` | `Observable<ServerSentEvent<T>>` | You are consuming server-sent events |
| `execute(method, path, init?)` | `fetch`, `fetch$`, `json`, or `json$` result | You need to pick one of those methods dynamically |
| `abort()` | `void` | You want to cancel every in-flight request started by this client instance |

Deprecated aliases still exist, but new code should prefer `fetch()` and `json()` over `fetchAsync()` and `jsonAsync()`.

### Promise Or Observable?

- Use promise methods when you just want the result of a single request.
- Use observable methods when you want RxJS composition, cancellation by unsubscribe, or stream-based integration.
- Observable methods are cold. Nothing is sent until you subscribe.
- Promise methods are implemented with `firstValueFrom(...)` on the corresponding observable method.
- `request$` and `response$` let you observe outgoing requests and incoming responses for that client instance.

In practical terms:

- `json('/items')` is the simplest choice for page load or command-style calls.
- `json$('/items')` is the better choice when the request depends on another stream such as route params, user selections, debounced search terms, refresh triggers, or SSE event handling.

See [Observable Patterns](docs/observable-patterns.md) for RxJS composition, cancellation, request and response inspection, and selector reuse.

## Selectors And Handlers

Selectors and handlers solve different problems:

- selectors shape the response value your application consumes
- request handlers shape outgoing transport behavior
- response handlers enforce response policies before selector parsing runs

Built-in selectors include `jsonSelector`, `blobSelector`, and `createSseSelector`. The default request pipeline includes `capitalizeRequestMethodOperator()` and `requestValidationOperator()`.

See [Selectors and Handlers](docs/selectors-and-handlers.md) for guidance on when to use each API, how to add reusable operators, and how to keep transport concerns separate from response parsing.

## Server-Sent Events

Use `client.sse$()` when the endpoint returns `text/event-stream` and you want parsed event objects instead of manually reading the stream. For lower-level composition, use `createSseSelector` or `sseMap`.

See [Server-Sent Events](docs/server-sent-events.md) for `sse$()` usage, event filtering, heartbeat handling, abort behavior, lower-level SSE helpers, and `ServerSentEventResponseError` handling.

## Error Types

| Error | When it is used |
| --- | --- |
| `ClientNotFoundException` | `createClient(name)` is called with a key that is neither configured nor an absolute `http:` or `https:` URL |
| `HttpResponseError` | Generic response or selector failure, including synchronous selector execution failures |
| `HttpJsonResponseError` | JSON parsing failures or non-OK JSON responses |
| `ServerSentEventResponseError` | Invalid SSE responses such as non-OK status, unreadable body, or wrong content type |

Native fetch errors can still surface as well, including abort and network failures.

## Advanced Guides

- [Client Configuration](docs/client-configuration.md): named clients, `configureHttpClient`, `configureHttp`, `onCreate`, custom client classes, and ad-hoc clients
- [Observable Patterns](docs/observable-patterns.md): `fetch$`, `json$`, `request$`, `response$`, cancellation, and RxJS composition
- [Selectors and Handlers](docs/selectors-and-handlers.md): `jsonSelector`, `blobSelector`, request handlers, response handlers, and built-in operators
- [Server-Sent Events](docs/server-sent-events.md): `sse$`, `createSseSelector`, `sseMap`, event filtering, heartbeats, and abort behavior

## Things To Remember

- `createClient(name)` throws `ClientNotFoundException` for unknown client keys.
- `hasClient(name)` is useful when a client configuration may be optional.
- `json()` and `json$()` stringify object bodies with `JSON.stringify(...)` and append JSON request headers.
- `fetch()` and `fetch$()` leave the response untouched unless you provide a `selector`.
- `execute()` currently supports `fetch`, `fetch$`, `json`, and `json$` only.
- If you configure a client through `config.http.configureClient(name, callback)`, that callback is stored as `onCreate` and runs every time a new client instance is created.

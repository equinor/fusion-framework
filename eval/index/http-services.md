# HTTP & Services

Ensure results reference `@equinor/fusion-framework-module-http`, `@equinor/fusion-framework-module-service-discovery`, `@equinor/fusion-framework-module-services`, or `@equinor/fusion-framework-module-signalr` packages.
Verify that mentioned methods, types, and configuration helpers are real exports from these packages.
Reject results that confuse HTTP client configuration with service discovery, or that reference deprecated aliases without noting the preferred replacement.

## How to configure and use named HTTP clients

- must mention `configureHttpClient` for registering a named client during setup
- must show `createClient(name)` for obtaining a fresh client instance at runtime
- must show `json()` or `json$()` for JSON API calls
- must mention `baseUri` and `defaultScopes` as configuration options
- should mention `onCreate` callback for adding shared request headers or guards
- should mention that each `createClient` call returns a fresh instance (factory pattern, not singleton)
- should mention `fetch()`, `blob()`, and `sse$()` as alternative response methods

## How to use HTTP request and response operators

- must mention `HttpRequestHandler` and `HttpResponseHandler` from `@equinor/fusion-framework-module-http/operators`
- must mention `requestHandler` and `responseHandler` on the client instance for adding operators
- must mention `request$` and `response$` observables for inspecting outgoing requests and incoming responses
- should mention built-in operators `capitalizeRequestMethodOperator` and `requestValidationOperator`
- should mention `jsonSelector` and `blobSelector` from `@equinor/fusion-framework-module-http/selectors`
- should mention `HttpResponseError` and `HttpJsonResponseError` from `@equinor/fusion-framework-module-http/errors`

## How to discover and resolve backend services at runtime

- must mention `enableServiceDiscovery` from `@equinor/fusion-framework-module-service-discovery`
- must show `resolveService(key)` for looking up a service URI and scopes by name
- must mention that the module depends on an HTTP client keyed `service_discovery`
- should show `createClient(serviceName)` on the service discovery provider for obtaining a pre-configured HTTP client
- should mention caching of resolved services via `@equinor/fusion-query` with a 5-minute TTL
- should mention session overrides via `sessionStorage` key `overriddenServiceDiscoveryUrls` for local development

## How to use pre-built API service wrappers

- must mention `enableServices` from `@equinor/fusion-framework-module-services`
- must mention at least two domain clients: `BookmarksApiClient`, `ContextApiClient`, `NotificationApiClient`, or `PeopleApiClient`
- must show a `create*Client` factory call such as `createBookmarksClient` or `createContextClient`
- should mention versioned endpoint methods (e.g. `v1`, `v2`, `v4`) with type-safe request/response shapes
- should mention `schemaSelector` for Zod-based response validation
- should mention `ApiProviderError` for structured error handling on non-OK responses

## How to establish real-time connections with SignalR

- must mention `enableSignalR` from `@equinor/fusion-framework-module-signalr`
- must show subscribing to hub messages via `connect(hubName, methodName)` returning an RxJS `Observable`
- must mention `Topic` as the observable wrapper for a hub method
- should mention service-discovery shorthand with `service` and `path` options for automatic URL and token resolution
- should mention that hub connections are reference-counted and automatically stopped when all subscribers unsubscribe
- should mention `send()` for fire-and-forget and `invoke()` for request-response messaging

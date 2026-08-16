# Mock Fusion dependencies in app tests

Use module-owned `/mock` entry points to seed deterministic Fusion state while retaining each
module's real configurator, provider, validation, and lifecycle. Import only the boundary the
app test needs; the React app test fixture already composes the normal framework and app
module scopes.

| App dependency | Import path | Primary API |
| --- | --- | --- |
| Analytics | `@equinor/fusion-framework-module-analytics/mock` | `MockAnalyticsAdapter` |
| App manifests and config | `@equinor/fusion-framework-module-app/mock` | `MockAppClient` |
| Browser authentication | `@equinor/fusion-framework-module-msal/mock` | `enableMsalMock`, `MsalMockClient`, `createMockToken` |
| Node authentication with Azure Identity | `@equinor/fusion-framework-module-azure-identity/mock` | `enableAuthMock`, `MockAuthProvider` |
| Node authentication with MSAL | `@equinor/fusion-framework-module-msal-node/mock` | `enableAuthMock`, `MockAuthProvider` |
| Bookmarks | `@equinor/fusion-framework-module-bookmark/mock` | `enableBookmarkMock`, `BookmarkMockConfigurator` |
| Context | `@equinor/fusion-framework-module-context/mock` | `enableContextMock`, `ContextMockConfigurator` |
| Context fixture generation | `@equinor/fusion-framework-module-context/mock/fixtures` | `createContextItemFactory`, `createContextItems` |
| Feature flags | `@equinor/fusion-framework-module-feature-flag/mock` | `enableFeatureFlagMock`, `FeatureFlagMockConfigurator` |
| HTTP routes and OpenAPI responses | `@equinor/fusion-framework-module-http/mock` | `createRouterMiddleware`, `createOpenApiMockMiddleware` |
| Service discovery | `@equinor/fusion-framework-module-service-discovery/mock` | `enableServiceDiscoveryMock`, `ServiceDiscoveryMockConfigurator` |
| Telemetry | `@equinor/fusion-framework-module-telemetry/mock` | `enableTelemetryMock`, `MockTelemetryAdapter` |

The event module has no mock entry point. `waitForEvent` and `watchEvents` from
`@equinor/fusion-framework-module-event/utils` observe the real event provider initialized by
the app test fixture.

## Authentication

App tests start with a deterministic signed-in `Test User`. Set a named account or `null`
through `configurator.msal.setAccount(...)` before rendering. The real MSAL provider still
runs its initialization, account, token, and logout behavior against the in-process client.

See [MSAL testing](../../../modules/msal/docs/testing.md) for signed-out startup, login flows,
deterministic JWTs, and individual client spies.

## App manifest and configuration

The `/test` entry point automatically resolves the current app's manifest, `app.config.ts`,
and module configurator. Use `enableAppManifestMock` when a custom parent framework must serve
those values, or `mockAppModules` for app module testing without React.

See [Application module testing](../../../app/docs/testing.md).

## Context

Use `enableContextMock` for known domain state without a context API or HTTP setup. The pool
starts empty; `setCurrentContext` seeds and selects one item, while `setContexts` only makes
items resolvable. Use HTTP middleware instead when the context service and transport pipeline
are part of the test.

See [Context testing](../../../modules/context/README.md#testing) for defaults, related-context
behavior, and deterministic fixture generators.

## Service discovery and HTTP

Use `enableServiceDiscoveryMock` to resolve services from an in-memory registry. Use
`configurator.http.addMiddleware` to answer a few explicit requests through the app's real
named clients. Use `createOpenApiMockMiddleware` when an OpenAPI document describes many
operations.

- [Service discovery testing](../../../modules/service-discovery/docs/testing.md)
- [HTTP testing](../../../modules/http/docs/testing.md)
- [OpenAPI mock](../../../utils/openapi-mock/README.md)

An HTTP middleware handles only requests for which it returns a `Response`. Calling
`next(uri, init)` delegates to the next middleware and eventually the real network.

## Events, analytics, and telemetry

- Observe the real event provider with `waitForEvent` or `watchEvents` from
  `@equinor/fusion-framework-module-event/utils`.
- Register `MockAnalyticsAdapter` to record analytics without exporting them.
- Use `enableTelemetryMock` and assert through `MockTelemetryAdapter.getItems` or
  `waitForItem`.

- [Event testing utilities](../../../modules/event/docs/testing.md)
- [Analytics testing](../../../modules/analytics/docs/testing.md)
- [Telemetry testing](../../../modules/telemetry/README.md#testing)

## Seed several app dependencies

Compose the app's real configuration with the module mocks required by the scenario:

```tsx
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';
import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';
import { test as baseTest } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

const project = {
  id: 'project-a',
  title: 'Project A',
  type: { id: 'ProjectMaster' },
  value: {},
};

export const test = baseTest.extend('configure', ({ configure }) => (configurator, args) => {
  configure?.(configurator, args);
  configurator.msal.setAccount({ name: 'Ada Lovelace' });
  enableContextMock(configurator, (mock) => mock.setCurrentContext(project));
  enableFeatureFlagMock(configurator, (mock) => {
    mock.addFeature({ key: 'new-search', enabled: true });
  });
});
```

The fixture declarations are reusable, while every test still receives fresh framework and
app module instances.

## Choose direct module mocks or HTTP

- Use a module mock for known domain state such as one current context, one account, or a set
  of feature flags.
- Use `configurator.http.addMiddleware` when the test must exercise the module's production
  service-discovery, HTTP-client, and response-handling pipeline.
- Use `createOpenApiMockMiddleware` when an OpenAPI document describes many operations.
- Use Vitest `vi.fn`, `vi.spyOn`, or `vi.mock` for individual JavaScript calls rather than a
  Fusion-specific wrapper.

See each owning package README or `docs/testing.md` for its defaults, builder methods, and
failure behavior.

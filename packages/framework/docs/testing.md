# Usage

Recipes for the situations a test normally runs into. Every one of them builds a real framework instance — only the boundaries that leave the process are substituted.

`mockFramework` takes a single callback, which receives a [`FrameworkMockConfigurator`](#the-configurator). That configurator **is** a `FrameworkConfigurator`, so everything an application does at configure time works here unchanged.

## Zero configuration

```typescript
import { mockFramework } from '@equinor/fusion-framework/mock';

const fusion = await mockFramework();

fusion.modules.auth.account?.name; // 'Test User'
await fusion.modules.serviceDiscovery.resolveService('apps'); // resolves offline
```

Every module declared by `FrameworkConfigurator` is initialized: `event`, `auth`, `http`, `serviceDiscovery`, `context` and `telemetry`.

## The configurator

Modules whose boundary is mocked expose their mock configurator directly, so a test configures them without registering a callback:

| Property | Type |
| --- | --- |
| `msal` | `MsalMockConfigurator` |
| `serviceDiscovery` | `ServiceDiscoveryMockConfigurator` |
| `http` | `IHttpClientConfigurator` (the real configurator — see [`.http`](testing-extending.md#http)) |
| `context` | `ContextMockConfigurator` |
| `telemetry` | `TelemetryMockConfigurator` |

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ name: 'Ada Lovelace' });
  configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
});
```

These are the real module configurators, so the real builder API, the real validation and the real provider are used.

## Choosing the signed-in user

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' });
});

const token = await fusion.modules.auth.acquireAccessToken({
  request: { scopes: ['Files.Read'] },
});
```

The token is a structurally valid JWT carrying the claims an application reads. It is unsigned by default and must never be accepted by anything but a test.

`setAccount` records configuration only — the user is signed in on the client before the provider initializes. It takes an object, `null` when nobody is signed in, or an ordinary config-builder callback resolving either:

```typescript
configurator.msal.setAccount(null);
configurator.msal.setAccount(async ({ hasModule }) => ({
  name: hasModule('app') ? 'App User' : 'Portal User',
}));
```

Because the user is in place before `MsalProvider.initialize()` runs, the provider's real start-up path acts on it — pair `signedOut` with `setRequiresAuth(true)` to watch the automatic login happen.

The account replaces any previously declared account, and is signed in on whichever client the module authenticates through — the one it builds, one supplied through `setClient`, or the host's when the module is hoisted onto a host application's provider. When that client cannot represent a declared user, it throws rather than failing quietly.

## Testing signed-out behaviour

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.msal.setAccount({ signedOut: true });
});

fusion.modules.auth.account; // null
```

Silent flows then resolve empty so the provider follows its unauthenticated path, while an explicit `login()` still succeeds — so a test can drive the sign-in journey, not only its end state.

## Composing the service registry

Nothing has to be constructed to add a service, or to move every service to a locally running mock server such as Mockoon or Prism — in which case the application makes real HTTP calls with nothing intercepting them.

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
  configurator.serviceDiscovery.addService({ key: 'my-api' });
  configurator.serviceDiscovery.removeService('bookmarks');
});
```

To replace the baseline registry outright rather than compose onto it, use `setServices`:

```typescript
configurator.serviceDiscovery.setServices([{ key: 'apps', uri: 'http://localhost:3000' }]);
```

By default an undeclared service resolves to a synthesised entry rather than throwing, so a test does not fail merely because the application resolved something the test did not think to declare. Call `setResolveUnknownServices(false)` to assert the opposite.

> [!WARNING]
> Built-in modules resolve services **while the framework starts** — the context module resolves `context`, for example. Combining `setResolveUnknownServices(false)` with a `setServices` registry that omits them fails initialization rather than the assertion you were writing. Either keep synthesis on, or declare every service the framework itself needs.

## Seeding context

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.context.setCurrentContext({ id: 'project-42', type: { id: 'ProjectMaster' }, value: {} });
});

fusion.modules.context.currentContext; // the seeded item
```

`configurator.context` is a `ContextMockConfigurator` — a small, context-domain vocabulary (`setCurrentContext`, `setContexts`, `addContext`, `setRelatedContexts`) covers seeding a known item with no HTTP mock and no service-discovery mock required. `setResolver` is the escape hatch for a custom resolution need the friendly methods do not cover. Real `ContextProvider` behaviour — `validateContext`, `resolveContext`, parent-context propagation — still runs against the seeded data in both.

This is one of two ways to fake context data: seeding an item directly (above) substitutes only the data source, with no transport involved. Mocking the context API's HTTP responses instead, through `.http`, exercises the real `ContextModuleConfigurator`/services/HTTP pipeline — reach for that when the test needs to cover that pipeline itself, optionally paired with `createOpenApiMockMiddleware` for faker-generated data straight from context's OpenAPI spec.

## Mocking an individual call

That is your test runner's job, not this entry point's. Mock clients are plain classes with ordinary methods, so any runner can spy on them with its own tooling — including call assertions and its own reset semantics.

```typescript
vi.spyOn(fusion.modules.serviceDiscovery.client, 'resolveService').mockResolvedValue(service);

afterEach(() => vi.restoreAllMocks());
```

The same holds for `bun:test`'s `spyOn` and Node's `t.mock.method`, which is why this entry point introduces no mocking API of its own.

## Configuring the framework as an application does

The configurator is a `FrameworkConfigurator`, so every `enableX` and `configureX` helper is available and behaves normally.

```typescript
const fusion = await mockFramework((configurator) => {
  configurator.onConfigured(() => {
    /* ... */
  });
});
```

Mocks are registered **before** the callback runs, so anything configured there wins — including replacing a mock with a different one.

## Registering your own modules

Pass your module descriptors as a type argument. They are then typed on both the configurator and the returned instance, so no cast is needed to reach them.

```typescript
const fusion = await mockFramework<[InvoiceModule]>((configurator) => {
  enableInvoicesMock(configurator, { total: 42 });
});

await fusion.modules.invoices.getInvoice('inv-1'); // fully typed
```

`addModule` is available if it reads better at the call site; it is sugar for the same call.

```typescript
configurator.addModule((c) => enableInvoicesMock(c, { total: 42 }));
```

> [!NOTE]
> Only modules that ship a mock configurator get a property such as `configurator.msal`. Everything else is registered exactly as it is in production — through its own `enableX` helper or `configurator.addConfig`. Module *instances* never exist at configure time; they are created by `initialize`.

See [Adding a mock for another module](./testing-extending.md) for how to give your module a test double, and a property on the configurator.

## Bringing your own configurator

`FrameworkMockConfigurator` can be constructed directly and initialized with `init`, which is useful when a test needs to hold on to the configurator.

```typescript
import { init } from '@equinor/fusion-framework';
import { FrameworkMockConfigurator } from '@equinor/fusion-framework/mock';

const configurator = new FrameworkMockConfigurator();
configurator.msal.setAccount({ name: 'Ada Lovelace' });

const fusion = await init(configurator);
```

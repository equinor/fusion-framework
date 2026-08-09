# Adding a mock for another module

How to give a module a test double, whether it is one of ours or one of yours.

## Mocking your own module

An application module needs no support from this entry point. Ship a test double next to the module and apply it alongside the framework mocks.

Two seams matter, and the second is the one teams miss:

1. **A client seam** — `setClient`, the way `MsalConfigurator.setClient` and `setServiceDiscoveryClient` do — so the object performing I/O can be swapped.
2. **Configuration on the builder** — so a test can adjust behaviour *without* constructing a client at all. `ServiceDiscoveryMockConfigurator.addService` is the reference: the configurator accumulates config, and the client is built from it when the module assembles its config.

```typescript
// @my-app/module-invoices/mock
export const mockInvoices = (configurator, options = {}) => {
  configurator.addConfig(
    configureInvoices((builder) => {
      builder.setClient({
        getInvoice: async (id) => ({ id, total: options.total ?? 100 }),
      });
    }),
  );
};
```

```typescript
// @my-app/module-invoices — the module's own type, exported for tests
export type InvoiceModule = Module<'invoices', InvoiceClient, InvoiceConfigurator>;
```

Pass that descriptor to `mockFramework` as a type argument, and the module is typed on both the configurator and the returned instance:

```typescript
const fusion = await mockFramework<[InvoiceModule]>((configurator) => {
  enableInvoicesMock(configurator, { total: 42 });
});

await fusion.modules.invoices.getInvoice('inv-1'); // typed, no cast
```

### Giving your module the same accessor as `.msal` and `.serviceDiscovery`

`enableInvoicesMock(configurator, options)` is enough on its own — the configurator it builds is discarded once configuration runs, which is fine when a test only ever sets options up front. Reach for an accessor when a test needs the configurator itself, for example to assert against it after the fact.

Subclass `FrameworkMockConfigurator` and use the protected `_pin`/`_getConfig` pair it exposes for exactly this — the same mechanism `.msal` and `.serviceDiscovery` are built from:

```typescript
class AppMockConfigurator extends FrameworkMockConfigurator<[InvoiceModule]> {
  constructor() {
    super();
    this._pin(invoiceMockModule);
  }

  get invoices(): InvoiceMockConfigurator {
    return this._getConfig('invoices');
  }
}
```

`_pin` replaces the module's own `configure` factory with one that always returns the same instance — pinning it before initialization runs is what lets a test reach `.invoices` synchronously and have it be the configurator the module is actually built from. `_getConfig` looks that instance up by name, throwing if nothing was pinned for it.

## What is not covered yet

`.services` and `.telemetry` are already reachable on `FrameworkMockConfigurator` — their `configure` factories take no `ref`, so they were safe to pin the same way `.msal` and `.serviceDiscovery` are. What is missing is a test double behind them: neither module has a `src/mock/` folder yet, so anything issuing an actual request through them still reaches the network. Adding one means creating that folder in **that module**, then pinning its mock configurator with `_pin` and exposing it with `_getConfig` on `FrameworkMockConfigurator`, replacing the real module descriptor pinned there today.

`event` is not pinned at all, deliberately: its `configure` factory reads `ref` to wire event bubbling to a parent event provider when `FrameworkMockConfigurator` is hoisted inside a host framework. Pinning would call `configure()` with `ref` always `undefined`, silently breaking that bubbling — so it is left to build the normal way, from the module system's own configure phase, where `ref` is actually known.

## `.http`

`.http` is backed by `HttpMockConfigurator` (`@equinor/fusion-framework-module-http/mock`): every named client it builds answers requests from registered route handlers instead of the network, so a test needs no locally running server.

```typescript
configurator.http.configureClient('catalog', { baseUri: 'https://api.example.com' });
configurator.http.get('/items', () => Response.json([{ id: 1 }]));

const items = await fusion.modules.http.createClient('catalog').json('/items');
```

Route handlers are Fetch-standard middleware — `(request: Request) => Response | undefined | Promise<...>` — matched in registration order, with `undefined` falling through to the next one. Three ways to fill that seam:

- **`.get`/`.post`/`.put`/`.patch`/`.delete`/`.on`** — hand-rolled handlers for a handful of routes.
- **`fromExpressStyleHandler`** — adapts an Express-style `(req, res)` handler (or a whole framework built from them, like `openapi-backend`) into middleware, so `.use(fromExpressStyleHandler(api.handleRequest))` drops it straight in.
- **`fromOpenApiMock`** — adapts an `@equinor/fusion-openapi-mock` instance (`createOpenApiMock(document)`), so a real `openapi.json`/`openapi.yaml` fakes every response with no handlers written at all until an edge case needs overriding.

All three are exported from `@equinor/fusion-framework-module-http/mock`.

## `.context`

`.context` is backed by `ContextMockConfigurator` (`@equinor/fusion-framework-module-context/mock`): context items live in an in-memory pool instead of a real context API, so a test needs no HTTP mock and no service-discovery mock to seed a known item.

```typescript
configurator.context.setCurrentContext({ id: 'my-ctx', type: { id: 'ProjectMaster' }, value: {} });

fusion.modules.context.currentContext; // the seeded item, resolved on startup
```

Real `ContextProvider` behaviour — `validateContext`, `resolveContext`, parent-context propagation — still runs against the seeded data; only the data source is substituted. Two layers cover different needs:

- **`setCurrentContext`/`setContexts`/`addContext`/`setRelatedContexts`** — a friendly, context-domain vocabulary for the common case: seed a known item, get it back.
- **`setResolver`** — an escape hatch for a custom `resolveContext` strategy or a shape the friendly layer did not anticipate.

Seeding a context item this way is one of two ways to fake context in a test — the other is mocking the context API's HTTP responses directly (with `.http`, optionally paired with `fromOpenApiMock`), which exercises the real `ContextModuleConfigurator`/services/HTTP pipeline instead of substituting it. Reach for `.context` to seed one known item with no transport involved; reach for `.http` when the test needs to cover that pipeline itself.


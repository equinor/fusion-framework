---
"@equinor/fusion-framework-module-context": major
---

Add `./mock` and `./mock/fixtures` subpaths for seeding context in tests without a real context API.

**BREAKING CHANGE:** `ContextModuleConfigurator` now extends `BaseConfigBuilder` (aligning with `module-event`, `module-http`, `module-msal`, and `module-service-discovery`). Its public `createConfig` method now returns `Observable<ContextModuleConfig>` instead of `Promise<ContextModuleConfig>`. Code calling `await configurator.createConfig(init)` directly should switch to `createConfigAsync`, which keeps the previous Promise-based behavior:

```typescript
// Before
const config = await configurator.createConfig(init);
// After
const config = await configurator.createConfigAsync(init);
```

No other public export changes as part of this refactor.

`./mock` exports `enableContextMock` and `ContextMockConfigurator` — a `ContextModuleConfigurator` backed by an in-memory pool instead of a real client. Only the data source is substituted; `validateContext`, `resolveContext`, and parent-context propagation all still run through the real `ContextProvider`:

```typescript
import { enableContextMock } from '@equinor/fusion-framework-module-context/mock';

enableContextMock(configurator, (mock) => {
  mock.setCurrentContext({ id: 'my-ctx', type: { id: 'ProjectMaster' }, value: {} });
});
```

`ContextMockConfigurator` also has `setContexts`, `addContext`, `setRelatedContexts` for the common cases, and `setResolver` as an escape hatch for custom resolution. Seeding an initial context this way overrides `resolveInitialContext` directly, so a test doesn't need a fake navigation module or parent framework instance just to start an app with a known context selected.

`./mock/fixtures` exports `createContextItems` and `createContextItemFactory`, generating realistic `ContextItem`s via an optional `@faker-js/faker` peer dependency — kept on a separate entry point so `enableContextMock` never pulls faker in for tests that don't need it:

```typescript
import { createContextItems } from '@equinor/fusion-framework-module-context/mock/fixtures';

const [project] = createContextItems([{ type: 'ProjectMaster' }]);
```

Also exports `parseContextItem` from the `./utils` subpath (parses a raw API context entity into a `ContextItem`), and reorganizes internal selector/configurator files without changing any existing public export.

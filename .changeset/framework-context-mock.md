---
"@equinor/fusion-framework": minor
---

`FrameworkMockConfigurator.context` is now backed by `ContextMockConfigurator` from `@equinor/fusion-framework-module-context/mock` instead of the real `ContextModuleConfigurator` — context resolution in tests no longer performs real I/O:

```typescript
const configurator = new FrameworkMockConfigurator();
configurator.context.setCurrentContext({ id: 'my-ctx', type: { id: 'ProjectMaster' }, value: {} });

const fusion = await init(configurator);
```

This changes the type returned by `.context` from `ContextModuleConfigurator` to `ContextMockConfigurator` (which extends it) — code relying on `.context` being exactly `ContextModuleConfigurator` should switch to seeding data through the new mock methods (`setCurrentContext`, `setContexts`, `addContext`, `setRelatedContexts`, `setResolver`) instead of configuring a real client.

`docs/testing.md`, `docs/testing-extending.md` and `docs/testing-api.md` are updated to describe both mocking strategies now available for context: the in-memory `ContextMockConfigurator` above, and mocking the context API's HTTP responses directly for tests that need to exercise the real configurator/services/HTTP pipeline.

---
"@equinor/fusion-framework-module": patch
---

Fix `ModulesConfigurator.addConfig` re-registration semantics for a module name that is already registered.

Previously, re-registering the same module name always discarded the module's prior `configure`/`afterConfig`/`afterInit` callbacks outright — even when the exact same module descriptor was passed again. This broke any config function that registered more than one named client against a shared module singleton, for example calling `configureHttpClient`/`useFrameworkServiceClient` more than once from `@equinor/fusion-framework-module-http`:

```typescript
configurator.configureHttpClient('products', { baseUri });
configurator.configureHttpClient('users', { baseUri });
```

Only the **last** call's client was actually registered; earlier ones threw `No registered http client for key [products]` at `createClient()` time, with no error at configuration time.

`addConfig` now distinguishes the two cases: re-registering the exact same module descriptor for a name stays **additive** (prior callbacks are kept, and the new ones run alongside them), so multiple named clients registered this way all work correctly. Re-registering a **genuinely different** module descriptor for the same name still **replaces** the prior `configure`/`afterConfig`/`afterInit` callbacks outright, preventing stale callback execution — the case mock modules like `enableMsalMock` rely on when overriding a real module registration.

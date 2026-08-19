---
"@equinor/fusion-framework-module": patch
---

Fix `ModulesConfigurator.addConfig` discarding previously registered `configure`/`afterConfig`/`afterInit` callbacks whenever it was called again for the same module name — even when the module descriptor itself was the exact same object.

This broke any config function that registered more than one named client against a shared module singleton, for example calling `configureHttpClient`/`useFrameworkServiceClient` more than once from `@equinor/fusion-framework-module-http`:

```typescript
configurator.configureHttpClient('products', { baseUri });
configurator.configureHttpClient('users', { baseUri });
```

Previously, only the **last** call's client was actually registered; earlier ones threw `No registered http client for key [products]` at `createClient()` time, with no error at configuration time. `addConfig` now only discards previous callbacks when a genuinely different module descriptor replaces the old one for that name — re-registering the same descriptor (as these helpers do) stays additive, so multiple named clients register correctly.

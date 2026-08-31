---
"@equinor/fusion-framework-module-feature-flag": minor
---

Add a purpose-built mock, exported from a new `/mock` subpath (`@equinor/fusion-framework-module-feature-flag/mock`).

`enableFeatureFlagMock` swaps in an in-memory flag pool behind the real `FeatureFlagConfigurator`, `FeatureFlagProvider`, and toggle flows — `toggleFeature`, `toggleFeatures`, and `features$` all reach the seeded flags through the real provider logic, not a stand-in. `FeatureFlagMockConfigurator` adds `addFeature` and `setFeatures` for seeding state, replacing the `localStorage`/URL-toggle sources a real app would otherwise depend on:

```typescript
import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';

enableFeatureFlagMock(configurator, (mock) => {
  mock.addFeature({ key: 'my-flag', enabled: true });
});
```

No flags are assumed by default — a test that seeds nothing gets an empty `features` object, matching the real module's zero-plugin behaviour.

Related: equinor/fusion-core-tasks#1707.

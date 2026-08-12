---
"@equinor/fusion-framework-module-navigation": minor
---

Add `enableNavigationMock` under `@equinor/fusion-framework-module-navigation/mock`, so tests get deterministic in-memory navigation instead of the real browser history.

`NavigationConfigurator`'s default history provider picks browser history whenever `window` is defined — true in jsdom/happy-dom test environments — so a test's navigation state could leak into (and depend on) the real document location. `enableNavigationMock` forces `MemoryHistory` unconditionally, while the real `NavigationConfigurator`, `NavigationProvider`, basename localization, and navigate/push/replace flows all run unmodified.

```typescript
import { enableNavigationMock } from '@equinor/fusion-framework-module-navigation/mock';

enableNavigationMock(configurator, {
  configure: (config) => {
    config.setBasename('/apps/my-app');
    config.setInitialLocation('/users/42');
  },
});
```

A plain string still works as a basename-only shortcut, same as `enableNavigation`:

```typescript
enableNavigationMock(configurator, '/apps/my-app');
```

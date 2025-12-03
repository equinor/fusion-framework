---
"@equinor/fusion-framework-module-ag-grid": minor
---

Change `theme` configuration from direct `Theme` value to function `() => Theme` for lazy evaluation.

The `theme` property in `AgGridConfig` now accepts a function that returns a `Theme` instead of a `Theme` directly. This enables dynamic theme evaluation and better integration with theme systems.

```typescript
// Before
const config = {
  theme: myTheme
};

// After
const config = {
  theme: () => myTheme
};
```

Fixes: https://github.com/equinor/fusion-framework/issues/747

---
"@equinor/fusion-framework-module-ag-grid": minor
---

Internal: `theme` config property now expects a function `() => Theme` for lazy evaluation, but consumer APIs remain backward compatible.

Most consumers using `builder.setTheme()` do not need to migrate; it still accepts both `Theme` objects and functions. Only direct construction of `AgGridConfig` requires the function wrapper.

```typescript
// Internal API change (rare, direct config construction)
const config: AgGridConfig = {
  theme: () => myTheme
};

// Builder API remains backward compatible
builder.setTheme(myTheme); // still works
builder.setTheme((theme) => theme.withParams({...})); // also works
```

Fixes: https://github.com/equinor/fusion-framework/issues/747

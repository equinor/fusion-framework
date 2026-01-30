---
"@equinor/fusion-imports": minor
---

Add `createImportMetaResolvePlugin` export for Vite plugin support.

The `createImportMetaResolvePlugin` function is now exported for creating Vite plugins that resolve `import.meta.resolve()` calls at build time. This is particularly useful for React Router v7 route definitions that use `import.meta.resolve()` for lazy loading.

```typescript
import { createImportMetaResolvePlugin } from '@equinor/fusion-imports';
```


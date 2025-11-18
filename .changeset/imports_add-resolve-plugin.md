---
"@equinor/fusion-imports": minor
---

Add `createImportMetaResolvePlugin` export for Vite plugin support.

The `createImportMetaResolvePlugin` function is now exported for creating Vite plugins that resolve import.meta.resolve() calls:

```typescript
import { createImportMetaResolvePlugin } from '@equinor/fusion-imports';
```


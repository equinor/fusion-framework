---
"@equinor/fusion-imports": minor
---

Add new plugin exports for esbuild and Vite build pipelines.

- `createMarkdownRawPlugin`: esbuild plugin for `?raw` imports of markdown files, automatically included in `importScript` unless already present
- `createImportMetaResolvePlugin`: Vite plugin that resolves `import.meta.resolve()` calls at build time, useful for React Router v7 lazy-loaded route definitions

```typescript
import { createMarkdownRawPlugin, createImportMetaResolvePlugin } from '@equinor/fusion-imports';
```

---
"@equinor/fusion-imports": minor
---

Add `createMarkdownRawPlugin` export for esbuild markdown `?raw` import support.

The `createMarkdownRawPlugin` function is now exported for creating esbuild plugins that handle `?raw` imports for markdown files. This plugin is automatically included when using `importScript` unless already present in the plugins array.

```typescript
import { createMarkdownRawPlugin } from '@equinor/fusion-imports';
```


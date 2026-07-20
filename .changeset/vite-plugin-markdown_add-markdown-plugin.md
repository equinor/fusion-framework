---
"@equinor/fusion-framework-vite-plugin-markdown": minor
---

Add new Vite plugin for handling markdown file imports with `?raw` query parameter.

The `@equinor/fusion-framework-vite-plugin-markdown` package provides a Vite plugin that transforms imports like `import content from './README.md?raw'` into a module that exports the raw markdown content as a string. This matches the behavior of Vite's built-in `?raw` import.

```typescript
import { markdownPlugin } from '@equinor/fusion-framework-vite-plugin-markdown';

export default defineConfig({
  plugins: [markdownPlugin()],
});
```


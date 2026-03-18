---
"@equinor/fusion-framework-vite-plugin-raw-imports": minor
---

Add new Vite plugin for handling `?raw` imports in library mode.

This plugin enables importing files as raw strings using the `?raw` query parameter, with reliable support for Vite library builds (`build.lib`) where native `?raw` support may be inconsistent. Handles relative path resolution edge cases.

```typescript
import readmeContent from '../../README.md?raw';
```

The plugin is automatically included when using `@equinor/fusion-framework-cli` for building applications.


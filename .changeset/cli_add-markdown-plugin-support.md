---
"@equinor/fusion-framework-cli": minor
---

Automatically include markdown plugin in app builds and manifest loading.

The CLI now automatically includes the `@equinor/fusion-framework-vite-plugin-markdown` plugin in all app builds, enabling support for markdown file imports with `?raw` query parameter without requiring manual configuration. The plugin is also included during app manifest loading to handle markdown imports in route definitions.

Apps can now import markdown files directly:

```typescript
import readmeContent from './README.md?raw';
```


---
"@equinor/fusion-framework-cli": minor
---

Add automatic support for `?raw` imports in Vite builds.

The CLI now automatically includes the `rawImportsPlugin` in Vite configurations, enabling `?raw` imports for markdown files (and other configured extensions) without manual plugin configuration.

```typescript
import readmeContent from '../../README.md?raw';
```

This ensures consistent behavior across all Fusion Framework CLI builds.


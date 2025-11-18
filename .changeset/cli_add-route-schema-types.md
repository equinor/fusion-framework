---
"@equinor/fusion-framework-cli": minor
---

Add route schema type exports for app manifest generation.

The following types are now exported from `@equinor/fusion-framework-cli/app`:
- `RouteSchemaEntry` - Type for route schema entries in app manifests
- `AppManifestWithRoutes` - Extended app manifest type with routes

```typescript
import type { RouteSchemaEntry, AppManifestWithRoutes } from '@equinor/fusion-framework-cli/app';
```


---
"@equinor/fusion-framework-module-app": minor
---

Add route schema support to app manifests for documentation and API schema generation.

**New Features:**
- Added `RouteSchemaEntry` type for documenting routes in app manifests
- Added `routes` field to `AppManifest` interface for route schema entries

```typescript
import type { RouteSchemaEntry, AppManifest } from '@equinor/fusion-framework-module-app';

const manifest: AppManifest = {
  appKey: 'my-app',
  displayName: 'My App',
  description: 'My app description',
  type: 'standalone',
  routes: [
    ['/', 'Home page'],
    ['/products', 'Products listing page'],
    ['/products/:id', 'Product detail page', { id: 'Product ID' }],
  ],
};
```


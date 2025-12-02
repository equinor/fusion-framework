---
"@equinor/fusion-framework-module-app": minor
"@equinor/fusion-framework-cli": minor
---

Add route schema support to app manifests for documentation and API schema generation.

**New Features:**

- **module-app**: Added `RouteSchemaEntry` type and `routes` field to `AppManifest` interface
- **cli**: Added `RouteSchemaEntry` and `AppManifestWithRoutes` type exports for app manifest generation

Route schemas allow applications to document their routes in app manifests, enabling automatic API documentation and schema generation. The `RouteSchemaEntry` type represents a route with its path, description, and optional parameter/search schemas.

```typescript
import type { RouteSchemaEntry, AppManifest } from '@equinor/fusion-framework-module-app';
import type { AppManifestWithRoutes } from '@equinor/fusion-framework-cli/app';

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

The CLI package also exports `AppManifestWithRoutes` which allows RouteNode objects (from the router package) to be used in manifest definitions, which are then serialized to RouteSchemaEntry arrays.


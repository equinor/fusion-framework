---
"@equinor/fusion-framework-react-router": minor
---

Add new React Router package with DSL API for React Router v7 routes.

This package provides a thin layer on top of React Router v7 that integrates with Fusion Framework:
- Integrates with Fusion navigation module for history and basename
- Uses a DSL (`layout`, `index`, `route`, `prefix`) to define routes in a file-based style
- Injects Fusion context into loaders, actions, and components via a `fusion` object
- Supports lazy loading with automatic code splitting
- Supports route schema generation for documentation and manifests

```typescript
import { Router } from '@equinor/fusion-framework-react-router';
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout(import.meta.resolve('./MainLayout.tsx'), [
  index(import.meta.resolve('./HomePage.tsx')),
  prefix('products', [
    index(import.meta.resolve('./ProductsPage.tsx')),
    route(':id', import.meta.resolve('./ProductPage.tsx')),
  ]),
]);

export default function AppRouter() {
  return <Router routes={pages} />;
}
```

Use this package when building Fusion apps that should use the Fusion navigation module, share services across routes via router context, and describe routes with schemas for manifests or documentation.


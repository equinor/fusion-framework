---
"@equinor/fusion-framework-react-router": minor
---

Add new React Router package with DSL API for React Router v7 routes.

This package provides a thin layer on top of React Router v7 that integrates with Fusion Framework:
- Integrates with Fusion navigation module for history and basename
- Uses a DSL (`layout`, `index`, `route`, `prefix`) to define routes
- Injects Fusion context into loaders, actions, and components via a `fusion` object
- Supports lazy loading and route schemas for documentation

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


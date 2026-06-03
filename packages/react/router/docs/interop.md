# Interop entry point — `@equinor/fusion-framework-react-router/interop`

The `/interop` entry point re-exports symbols from `react-router` that are not part of the standard Fusion router surface area. These exports exist as an interop bridge for teams mid-migration and **will be removed in a future major version**.

> **Do not use these in new code.** They are only here to avoid breaking existing consumers during migration.

## What is exported

Only a curated selection of `react-router` symbols is exposed here. If you need something that is missing, [open an issue](https://github.com/equinor/fusion/issues) describing your use case.

```ts
import {
  // Test and widget utilities
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,

  // React Router v6 JSX-based routing (replaced by RouteObject DSL)
  Routes,
  Route,
} from '@equinor/fusion-framework-react-router/interop';
```

## When to use each

### `MemoryRouter`

An in-memory router that never touches browser history. Use it to wrap a single component in a unit test or to embed an isolated widget that must not affect the host page URL.

```tsx
import { render } from '@testing-library/react';
import { MemoryRouter } from '@equinor/fusion-framework-react-router/interop';
import { MyComponent } from './MyComponent';

render(
  <MemoryRouter initialEntries={['/items/42']}>
    <MyComponent />
  </MemoryRouter>,
);
```

### `createMemoryRouter` + `RouterProvider`

Use when your component depends on loaders, actions, or nested routes. `createMemoryRouter` builds a full router instance backed by in-memory history; `RouterProvider` mounts it.

```tsx
import { render } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
} from '@equinor/fusion-framework-react-router/interop';

const router = createMemoryRouter(
  [
    {
      path: '/items/:id',
      Component: MyComponent,
      loader: () => ({ name: 'Item 42' }),
    },
  ],
  { initialEntries: ['/items/42'] },
);

render(<RouterProvider router={router} />);
```

### `Routes` and `Route`

JSX-based route components from React Router v6. These are provided for codebases that have not yet migrated to the `RouteObject` DSL.

```tsx
import { Routes, Route } from '@equinor/fusion-framework-react-router/interop';

// Wrap with MemoryRouter or a real router
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/products/:id" element={<ProductPage />} />
</Routes>
```

Migrate to `RouteObject[]` passed to `<Router>` or the Fusion DSL (`layout`, `index`, `route`, `prefix`) from `/routes`.

## Why are these deprecated?

These utilities belong to `react-router` and are intentionally not part of the Fusion router's main public API surface. Exposing them here avoids teams adding `react-router` as a separate dependency — which would risk bundling two copies of the router — while they complete their migration to the Fusion patterns.

Once your codebase no longer uses this entry point, remove the import. The symbols remain available from `react-router` through the peer dependency resolution handled by your package manager.

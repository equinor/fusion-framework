# Migrating from `react-router` to `@equinor/fusion-framework-react-router`

This guide covers migrating an app that uses `react-router` directly to the Fusion Framework router integration.

## Why migrate?

The Fusion router wraps React Router v7 and adds:

- Automatic wiring of `history` and `basename` from the Fusion navigation module — no manual setup.
- Typed `fusion` context injected into every loader, action, and component — no prop drilling or extra React contexts.
- A file-style route DSL (`layout`, `index`, `route`, `prefix`) that replaces hand-built `RouteObject` trees.
- Route schema generation for portals, manifests, and documentation tooling.

## Step 1 — Replace the router setup

**Before** (plain React Router):

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/products/:id', element: <ProductPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

**After** (Fusion router):

```tsx
import { Router } from '@equinor/fusion-framework-react-router';

const routes = [
  { path: '/', Component: HomePage },
  { path: '/products/:id', Component: ProductPage },
];

export default function App() {
  return <Router routes={routes} />;
}
```

`<Router>` picks up `history` and `basename` from the Fusion navigation module automatically. You do not create or manage a router instance.

## Step 2 — Replace the route DSL (recommended)

Instead of `RouteObject[]`, use the Fusion DSL for a cleaner, file-based structure:

```ts
// src/pages/index.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout('./MainLayout.tsx', [
  index('./HomePage.tsx'),
  prefix('products', [
    index('./ProductsPage.tsx'),
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

The Vite plugin transforms these DSL calls into standard `RouteObject` code at build time. See the [Vite plugin section](../README.md#vite-plugin) in the README.

## Step 3 — Replace loader and action signatures

Fusion injects a `fusion` argument into every loader and action. Update your function signatures:

**Before:**

```ts
export async function loader({ params }: LoaderFunctionArgs) {
  return fetch(`/api/products/${params.id}`);
}
```

**After:**

```ts
import type { LoaderFunctionArgs } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ params, fusion }: LoaderFunctionArgs<{ id: string }>) {
  const client = fusion.modules.http.createHttpClient('products');
  return client.json(`/products/${params.id}`);
}
```

The `fusion.modules` object exposes all configured Fusion modules. The `fusion.context` object exposes any custom context passed to `<Router context={...} />`.

## Step 4 — Replace component props

Route components receive `loaderData`, `actionData`, and `fusion` as props instead of calling hooks:

**Before:**

```tsx
import { useLoaderData } from 'react-router';

export default function ProductPage() {
  const data = useLoaderData();
  return <h1>{data.name}</h1>;
}
```

**After:**

```tsx
import type { RouteComponentProps } from '@equinor/fusion-framework-react-router';

export default function ProductPage({ loaderData }: RouteComponentProps<{ name: string }>) {
  return <h1>{loaderData.name}</h1>;
}
```

## Step 5 — Replace hook imports

All standard React Router hooks are re-exported from the Fusion router package. Replace the import source:

```ts
// Before
import { useNavigate, useParams, useLocation } from 'react-router';

// After
import { useNavigate, useParams, useLocation } from '@equinor/fusion-framework-react-router';
```

## Step 6 — Remove `react-router` from your dependencies

Once all imports are updated, remove `react-router` from your `package.json`. It is a peer dependency of `@equinor/fusion-framework-react-router` and will always be present — adding it separately risks bundling two copies of the router.

```bash
pnpm remove react-router
```

## Common questions

### Can I still use `useLoaderData` and `useParams` hooks?

Yes. They are re-exported from `@equinor/fusion-framework-react-router` and work exactly as in React Router. The prop-based API is optional and preferred for type safety.

### Can I mix `RouteObject[]` and the DSL?

Yes. `<Router>` accepts both. You can migrate route by route.

### What about `<Outlet />`, `<Link />`, `<NavLink />`?

All re-exported from `@equinor/fusion-framework-react-router`. No import changes needed beyond the source package.

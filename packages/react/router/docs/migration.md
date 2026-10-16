# Migrating to React Router v8 and `@equinor/fusion-framework-react-router`

This guide covers upgrading from plain `react-router` or Fusion router v7 to the Fusion router on React Router v8.

If you are starting a new app, use the [getting started guide](getting-started.md) instead.

## Upgrade requirements

**React Router v8 requires React 19.2.7 or later.** This is a major version requirement:

```bash
pnpm up react@^19.2.7 react-dom@^19.2.7
pnpm up @equinor/fusion-framework-react-router
```

**Key requirements:**
- `react` ^19.2.7 (required peer dependency; React 18 is no longer supported)
- `react-dom` ^19.2.7 (required peer dependency)
- Node.js 22.22.0+ (React Router v8 is ESM-only)
- ESM-compatible build and test setup

> [!NOTE]
> Remove `react-router` and `react-router-dom` from your direct dependencies if present. React Router is bundled by the Fusion package.

## Why migrate to the Fusion router?

The Fusion router wraps React Router v8 and adds:

- Automatic wiring of `history` and `basename` from the Fusion navigation module — no manual setup.
- Typed `fusion` context injected into every loader, action, and component — no prop drilling or extra React contexts.
- A file-style route DSL (`layout`, `index`, `route`, `prefix`) that replaces hand-built `RouteObject` trees.
- Route schema generation for portals, manifests, and documentation tooling.

## Migrating from plain React Router

### Step 1 — Replace router setup

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

`<Router>` picks up `history` and `basename` from the Fusion navigation module automatically. The navigation module must be **enabled in your app's configurator**. See the [getting started guide](getting-started.md) for full setup.

### Step 2 — Use the Fusion route DSL (recommended)

Instead of hand-built `RouteObject[]`, use the Fusion DSL:

```ts
// src/routes.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export default layout('./Layout.tsx', [
  index('./HomePage.tsx'),
  prefix('products', [
    index('./ProductsPage.tsx'),
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

The Vite plugin transforms these into standard `RouteObject` code at build time. You can also pass plain `RouteObject[]` to `<Router>` — both work.

### Step 3 — Update loader and action signatures

Fusion injects `fusion` into every loader and action:

**Before:**

```ts
export async function loader({ params }: LoaderFunctionArgs) {
  return fetch(`/api/products/${params.id}`);
}
```

**After:**

```ts
import type { LoaderFunctionArgs } from '@equinor/fusion-framework-react-router';

export async function loader({ params, fusion }: LoaderFunctionArgs<{ id: string }>) {
  const client = fusion.modules.http.createHttpClient('products');
  return client.json(`/products/${params.id}`);
}
```

The `fusion.modules` object exposes configured Fusion modules. The `fusion.context` object contains any custom context passed to `<Router context={...} />`.

### Step 4 — Update component props

Route components receive `loaderData`, `actionData`, and `fusion` as props:

**Before** (using hooks):

```tsx
import { useLoaderData } from 'react-router';

export default function ProductPage() {
  const data = useLoaderData();
  return <h1>{data.name}</h1>;
}
```

**After** (using props):

```tsx
import type { RouteComponentProps } from '@equinor/fusion-framework-react-router';

export default function ProductPage({ loaderData }: RouteComponentProps<{ name: string }>) {
  return <h1>{loaderData.name}</h1>;
}
```

Hooks like `useLoaderData` still work and are re-exported from the Fusion package — use whichever pattern you prefer.

### Step 5 — Update imports

All standard React Router hooks and components are re-exported from the Fusion package:

```ts
// Before
import { useNavigate, useParams, Link } from 'react-router-dom';

// After
import { useNavigate, useParams, Link } from '@equinor/fusion-framework-react-router';
```

Available re-exports: `useNavigate`, `useParams`, `useLocation`, `useLoaderData`, `useActionData`, `useMatches`, `useNavigation`, `Link`, `NavLink`, `Outlet`, `Form`, `useSubmit`, `redirect`, `isRouteErrorResponse`, and others.

### Step 6 — Remove direct dependencies

```bash
pnpm remove react-router react-router-dom
```

React Router is already bundled by the Fusion package.

## Migrating existing Fusion v7 apps

If you are already using the Fusion router on React Router v7, the same steps apply. The Fusion router API is stable across v7 and v8. See below for what changed in React Router itself.

## What changed in React Router v8

### `react-router-dom` merged into `react-router`

React Router v8 removes the `react-router-dom` package. All browser routing exports are now in `react-router`. For Fusion apps, import from `@equinor/fusion-framework-react-router` instead.

### Route object properties

Both old and new property names work in v8, but the new names are recommended:

| Old (v7) | New (v8) | Note |
|---|---|---|
| `element` | `Component` | Both work; `Component` is now preferred |
| `errorElement` | `ErrorBoundary` | Both work in Fusion Router |

Example with v8 naming:

```ts
{
  path: '/products/:id',
  Component: ProductPage,
  ErrorBoundary: ErrorBoundary,
}
```

Fusion Router supports both forms. See the [tests](https://github.com/equinor/fusion-framework/blob/main/packages/react/router/src/__tests__/router-v8.test.tsx) for both patterns in use.

### Error boundaries

Errors in loaders and components trigger error boundaries immediately. Both `errorElement` and `ErrorBoundary` properties work:

```tsx
// errorElement form (still supported)
{
  path: '/',
  Component: HomePage,
  errorElement: ({ error }) => <p>Error: {error.message}</p>,
}

// ErrorBoundary form (new)
{
  path: '/',
  Component: HomePage,
  ErrorBoundary: ({ error }) => <p>Error: {error.message}</p>,
}
```

Fusion Router passes `error` and `fusion` as props to error boundaries.

### ESM-only

React Router v8 is ESM-only. Node.js 22.22.0+ is required at runtime.

**If your build outputs CommonJS or uses CommonJS-only loaders:**

Update your build configuration:
- **Vite**: default ESM output ✓
- **esbuild**: set `format: 'esm'`
- **tsc**: set `module: 'esnext'` in `tsconfig.json`
- **Vitest**: default ESM support ✓

**Errors:**
```
ERR_REQUIRE_ESM: require() of ES Module not supported
```

This means your build or test setup is trying to load the router as CommonJS. Update your build configuration to support ESM.

## Incremental migration

The `/interop` entry point provides test utilities and v6-style JSX routing for gradual migration:

```tsx
import { MemoryRouter, createMemoryRouter, RouterProvider } from '@equinor/fusion-framework-react-router/interop';
import { Routes, Route } from '@equinor/fusion-framework-react-router/interop';
```

> [!WARNING]
> The `/interop` entry point is deprecated and will be removed in a future major version. Use only during migration.

See [the interop guide](interop.md) for details.

## Accessing Fusion context

**In loaders and actions:**

```ts
export async function loader({ params, fusion }: LoaderFunctionArgs) {
  const http = fusion.modules.http;
  const context = fusion.context;
  // ...
}
```

**In components via props:**

```tsx
export default function Page({ fusion }: RouteComponentProps) {
  const http = fusion.modules.http;
  // ...
}
```

**In components via hook:**

```tsx
import { useRouterContext } from '@equinor/fusion-framework-react-router';

export default function Page() {
  const { modules, context } = useRouterContext();
  // ...
}
```

## Common questions

### Can I still use `useLoaderData` and `useParams` hooks?

Yes. They are re-exported and work as in React Router. Props-based components are recommended for type safety, but hooks still work.

### Can I mix `RouteObject[]` and the Fusion DSL?

Yes. `<Router>` accepts both. Migrate route by route.

### What about `<Outlet />`, `<Link />`, `<NavLink />`?

All re-exported from `@equinor/fusion-framework-react-router`. No import changes needed.

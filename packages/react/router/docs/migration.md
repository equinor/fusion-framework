# Migrating to React Router v8 and `@equinor/fusion-framework-react-router`

This guide covers upgrading from plain `react-router` or Fusion router v7 to the Fusion router on React Router v8.

If you are starting a new app, use the [getting started guide](getting-started.md) instead.

## Upgrade requirements

**React Router v8 requires React 19.2.7 or later.** This is a major version requirement:

The v8-based Fusion router is being prepared on the routing feature branch. Apply
these steps after its release is announced; upgrading today's stable package alone
does not guarantee the v8 baseline.

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
> Remove `react-router-dom` after updating its imports. Remove a direct `react-router`
> dependency only after replacing all direct imports with supported Fusion exports.
> If your app still imports an API from `react-router` or `react-router/dom`, retain a
> compatible direct dependency; do not rely on a transitive dependency being importable.

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

**After** (a page module referenced by the Fusion DSL):

```ts
import type { LoaderFunctionArgs } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ params, fusion }: LoaderFunctionArgs<{ id: string }>) {
  const client = fusion.modules.http.createHttpClient('products');
  return client.json(`/products/${params.id}`);
}
```

The `fusion.modules` object exposes configured Fusion modules. The `fusion.context` object contains any custom context passed to `<Router context={...} />`.

The existing Fusion Vite plugin maps a page module's `clientLoader` export to the
route object's `loader` property, and its `action` export to `action`. Hand-written
route objects continue to use `loader` and `action`. These are existing Fusion
conventions, not names introduced by React Router v8; do not rename an action
export to `clientAction`.

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

Common React Router hooks and components are re-exported from the Fusion package:

```ts
// Before
import { useNavigate, useParams, Link } from 'react-router-dom';

// After
import { useNavigate, useParams, Link } from '@equinor/fusion-framework-react-router';
```

Available re-exports: `useNavigate`, `useParams`, `useLocation`, `useLoaderData`, `useActionData`, `useMatches`, `useNavigation`, `Link`, `NavLink`, `Outlet`, `Form`, `useSubmit`, `redirect`, `isRouteErrorResponse`, and others.

### Step 6 — Remove unused direct dependencies

After replacing every direct import, remove dependencies your app no longer uses:

```bash
pnpm remove react-router react-router-dom
```

The Fusion package installs its own React Router dependency. If any imports still
come from `react-router` or `react-router/dom`, keep a compatible direct dependency
on `react-router` instead of removing it.

## Migrating existing Fusion v7 apps

If you already use Fusion with React Router v7, upgrade the runtime dependencies
and check direct upstream imports. Keep your existing route registry, page exports,
navigation configuration and startup code; adopting the DSL or new routing features
is a separate choice.

## What changed in React Router v8

### `react-router-dom` merged into `react-router`

React Router v8 removes the `react-router-dom` package. Use supported Fusion
re-exports, or the appropriate `react-router` / `react-router/dom` entry point with
a compatible direct dependency.

### Route object properties

`element` / `Component` and `errorElement` / `ErrorBoundary` are existing route
property alternatives, not v8 renames. Do not mechanically rename working route
definitions as part of this upgrade.

### Error boundaries

Both Fusion `errorElement` and `ErrorBoundary` component forms remain supported.
The Fusion wrapper still supplies `error` and `fusion` props. The v8 compatibility
change removes the internal `hasErrorBoundary` property; applications should not
need to change their working error component for that reason.

### Middleware and v7 future flags

Upstream v8 makes its former v7 future behavior the default. Fusion uses client
Data Mode, not React Router Framework Mode. `v7_startTransition` was not a
middleware-enabling flag, and loaders/actions are not middleware.

Fusion's route-module middleware integration is delivered separately from this
dependency baseline. Upgrading React Router alone is not a replacement for that
integration, and Framework Mode `clientMiddleware` examples are not the Fusion
route-module API.

### ESM-only

React Router v8 is ESM-only and requires Node.js 22.22.0+ for Node-based tooling.

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
export async function clientLoader({ params, fusion }: LoaderFunctionArgs) {
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

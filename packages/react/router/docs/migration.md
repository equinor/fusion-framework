# Migrating to React Router v8 and `@equinor/fusion-framework-react-router`

This guide covers two migration paths:

1. **Apps on v7 or earlier** upgrading to the Fusion router on React Router v8
2. **Apps already on Fusion router/v7** upgrading to v8 and any new Fusion APIs

If you are starting a new app, use the [getting started guide](getting-started.md) instead.

## Upgrade requirements

**React Router v8 requires React 19.2.7 or later.** This is a major version requirement for both `react` and `react-dom`:

| Requirement | Value | Impact |
|---|---|---|
| `react` | `^19.2.7` | Required peer dependency; React 18 is no longer supported |
| `react-dom` | `^19.2.7` | Required peer dependency (no longer optional) |
| Node.js | `22.22.0+` | React Router v8 is ESM-only; CommonJS-only tooling will fail |
| Build and test setup | ESM support | CommonJS-only builds may need reconfiguration |

Update your `package.json` before installing the new Fusion router:

```bash
pnpm up react@^19.2.7 react-dom@^19.2.7
```

If you are on a framework or build tool that still requires CommonJS, it must support ESM externals or you cannot use React Router v8 yet.

## Why migrate to the Fusion router?

The Fusion router wraps React Router v8 and adds:

- Automatic wiring of `history` and `basename` from the Fusion navigation module — no manual setup.
- Typed `fusion` context injected into every loader, action, and component — no prop drilling or extra React contexts.
- A file-style route DSL (`layout`, `index`, `route`, `prefix`) that replaces hand-built `RouteObject` trees.
- Route schema generation for portals, manifests, and documentation tooling.

## Step 1 — Update dependencies

First, ensure React 19.2.7 or later is installed:

```bash
pnpm up react@^19.2.7 react-dom@^19.2.7
```

Then install or upgrade the Fusion router:

```bash
pnpm up @equinor/fusion-framework-react-router
```

> [!NOTE]
> If you currently have `react-router` or `react-router-dom` as a direct dependency in your `package.json`, remove them. React Router is bundled as a dependency of `@equinor/fusion-framework-react-router` — adding it separately risks bundling two copies.
> 
> **Exception:** If your build or test setup is CommonJS-only, you may need `react-router` as a direct dependency for tooling reasons. See [ESM-only builds](#esm-only-builds) below.

## Step 2 — Replace the router setup

The `<Router>` component works with both plain `RouteObject[]` and the Fusion DSL. Update your router instantiation:

**Before** (plain React Router with `createBrowserRouter`):

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

> [!IMPORTANT]
> The Fusion navigation module must be **enabled in your app's configurator**. See the [getting started guide](getting-started.md) for full setup instructions.

## Step 3 — Migrate the route DSL (recommended)

Instead of hand-built `RouteObject[]`, use the Fusion DSL for a cleaner, file-based structure:

```ts
// src/routes.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export default layout('./MainLayout.tsx', [
  index('./HomePage.tsx'),
  prefix('products', [
    index('./ProductsPage.tsx'),
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

The Vite plugin transforms these DSL calls into standard `RouteObject` code at build time. See the [Vite plugin section](../README.md#vite-plugin) in the router module docs.

**You can migrate route by route.** The `<Router>` component accepts both plain `RouteObject[]` and DSL output — mix them during migration if needed.

Note on imports: `react-router-dom` is removed upstream in v8. All routing imports come from `react-router`, `react-router/dom`, or `@equinor/fusion-framework-react-router`. The Fusion package re-exports the common hooks and components, so you typically won't need a direct `react-router` import.

## Step 4 — Update loader and action signatures

Fusion injects a `fusion` argument into every loader and action. Update your function signatures to use it:

**Before** (plain React Router):

```ts
import { LoaderFunctionArgs } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  return fetch(`/api/products/${params.id}`);
}
```

**After** (with Fusion context):

```ts
import type { LoaderFunctionArgs } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ params, fusion }: LoaderFunctionArgs<{ id: string }>) {
  const client = fusion.modules.http.createHttpClient('products');
  return client.json(`/products/${params.id}`);
}
```

The `fusion.modules` object exposes all configured Fusion modules (http, navigation, roles, etc.). The `fusion.context` object exposes any custom context passed to `<Router context={...} />`.

> [!NOTE]
> React Router v8 renamed `loader` and `action` to `clientLoader` and `clientAction` to distinguish them from server loaders. For now, both names work; use `clientLoader` and `clientAction` to match the standard.

## Step 5 — Update component props

Route components receive `loaderData`, `actionData`, and `fusion` as props instead of calling hooks:

**Before** (hooks-based):

```tsx
import { useLoaderData } from 'react-router';

export default function ProductPage() {
  const data = useLoaderData();
  return <h1>{data.name}</h1>;
}
```

**After** (props-based):

```tsx
import type { RouteComponentProps } from '@equinor/fusion-framework-react-router';

export default function ProductPage({ loaderData }: RouteComponentProps<{ name: string }>) {
  return <h1>{loaderData.name}</h1>;
}
```

The props-based API provides better type safety and is the recommended approach. However, hooks like `useLoaderData` still work if you prefer them — they are re-exported from the Fusion package.

## Step 6 — Update hook and component imports

All standard React Router hooks and components are re-exported from the Fusion router package. Replace the import source:

**Before:**

```ts
import { useNavigate, useParams, useLocation, Link, Outlet } from 'react-router-dom';
```

**After:**

```ts
import { useNavigate, useParams, useLocation, Link, Outlet } from '@equinor/fusion-framework-react-router';
```

Available re-exports include:

| Import | Use |
|---|---|
| `useNavigate` | Programmatic navigation |
| `useParams` | Current route parameters |
| `useLocation` | Current path and query string |
| `useLoaderData` | Loader result in component |
| `useActionData` | Last action result in component |
| `useMatches` | All matched routes |
| `useMatch` / `matchPath` | Pattern matching |
| `Link` / `NavLink` | Declarative navigation |
| `Outlet` | Render nested routes |
| `Form` / `useSubmit` | Form actions |
| `useNavigation` | Navigation state |
| `redirect` | Redirect in loaders/actions |
| `isRouteErrorResponse` | Error type narrowing |

If you need something not re-exported, you can import directly from `react-router` or `react-router/dom`.

## Step 7 — Clean up direct dependencies

Once all imports are updated, remove `react-router` and `react-router-dom` from your `package.json` if they are direct dependencies:

```bash
pnpm remove react-router react-router-dom
```

React Router is bundled as a direct dependency of `@equinor/fusion-framework-react-router` and will always be present. Adding it separately risks bundling two copies of the router.

> [!EXCEPTION]
> Keep `react-router` if your build setup (e.g., build tool, test framework, or type checking) specifically requires it as an external ESM module. This is rare but can happen with certain CommonJS fallback configurations.

---

## What changed from React Router v7 to v8

React Router v8 makes the v7 "future flags" the default behavior. This means most v7 apps will work unchanged, but a few patterns changed significantly.

### Removed: `react-router-dom` package

React Router v8 merges `react-router-dom` into `react-router`. All browser-based exports now come from `react-router` directly.

- `useNavigate`, `Link`, `NavLink`, etc. come from `react-router`, not `react-router-dom`
- `MemoryRouter`, `createMemoryRouter` come from `react-router`, not `react-router-dom`
- For Fusion apps, use `@equinor/fusion-framework-react-router` to avoid a direct dependency on `react-router`

### Changed: Route property names

React Router v8 renamed some route properties for clarity:

| v7 | v8 | Use |
|---|---|---|
| `element` | `Component` | The component to render for this route |
| `errorElement` | `ErrorBoundary` | Error boundary for this route |
| N/A | `clientLoader` | Loader that runs in the browser (alias: `loader`) |
| N/A | `clientAction` | Action that runs in the browser (alias: `action`) |

**Example:**

```ts
// v7
{ path: '/', element: <HomePage />, errorElement: <ErrorPage /> }

// v8
{ path: '/', Component: HomePage, ErrorBoundary: ErrorPage }
```

Both `element` and `Component` still work in v8 for backwards compatibility, but you should migrate to the new names.

### Changed: Route middleware is now always on

v7 had a future flag `v7_startTransition` to enable route middleware (the ability for routes to have `clientLoader` and `clientAction`). In v8, this is the default and cannot be disabled.

For Fusion apps, this means:

- All Fusion routes can have `clientLoader` and `clientAction` by default
- Transitions are automatic — you don't need to wrap anything in `startTransition()`
- Navigation is more responsive because long-running loaders don't block rendering

### Changed: Error handling

v8 renamed `errorElement` to `ErrorBoundary` and changed when it is invoked:

- `errorElement` (v7) vs `ErrorBoundary` (v8) — same concept, new name
- Errors in `clientLoader` now trigger the error boundary immediately, not after rendering
- The error boundary receives a `useRouteError()` hook to access the error

**Example:**

```tsx
// v8
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return <div>{error.status} {error.statusText}</div>;
  }
  
  return <div>Error: {String(error)}</div>;
}
```

### ESM-only, Node 22.22.0+

React Router v8 ships ESM only. CommonJS builds will fail to load the router.

- Your build tool must output ESM or support ESM externals
- Test setup must support ESM (vitest, @vitest/browser, etc.)
- Node.js 22.22.0 or later is required (earlier versions don't fully support ESM)
- Type checking and linting run normally in CommonJS, but at runtime ESM is required

**If your build is CommonJS-only:**

This is a blocker. You must either:
1. Update your build tool to support ESM output (Vite, esbuild, etc.)
2. Use a test runner that supports ESM (vitest)
3. Add ESM externals configuration to your build tool if it's still CommonJS

See the section below on [ESM-only builds](#esm-only-builds) for more guidance.

### Unchanged: Error boundaries and `errorElement`/`ErrorBoundary`

Fusion `<Router>` still sets up an error boundary for errors in `clientLoader` and route rendering. Your error element or error boundary function works as before.

---

## Common migration scenarios

### Incremental migration: using the interop bridge

If you have a large codebase and want to migrate incrementally, the `/interop` entry point provides v6-style JSX routing and test utilities:

```tsx
import { Routes, Route } from '@equinor/fusion-framework-react-router/interop';
import { MemoryRouter } from '@equinor/fusion-framework-react-router/interop';

// JSX-based routing (v6 style)
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/products/:id" element={<ProductPage />} />
</Routes>

// Memory router for testing
<MemoryRouter initialEntries={['/items/42']}>
  <MyComponent />
</MemoryRouter>
```

> [!WARNING]
> The `/interop` entry point is **deprecated** and will be removed in a future major version. It exists only to avoid breaking existing consumers during migration. Do not use these in new code.

See [the interop guide](interop.md) for full details on `Routes`, `Route`, `MemoryRouter`, `createMemoryRouter`, and `RouterProvider`.

### Data in Fusion context vs. component props

Both patterns are supported, but props are preferred for type safety:

**Using hooks (still works):**

```tsx
import { useLoaderData } from '@equinor/fusion-framework-react-router';

export default function Page() {
  const data = useLoaderData();
  return <div>{data.name}</div>;
}
```

**Using props (recommended):**

```tsx
import type { RouteComponentProps } from '@equinor/fusion-framework-react-router';

export default function Page({ loaderData }: RouteComponentProps) {
  return <div>{loaderData.name}</div>;
}
```

### Accessing the Fusion modules and context

Both the props API and hooks can access `fusion.modules` and `fusion.context`:

**In loaders/actions:**

```ts
export async function clientLoader({ params, fusion }: LoaderFunctionArgs) {
  const http = fusion.modules.http;
  const roles = fusion.modules.roles;
  return { /* ... */ };
}
```

**In components via props:**

```tsx
export default function Page({ fusion }: RouteComponentProps) {
  // fusion.modules and fusion.context are available
  return <div>{/* ... */}</div>;
}
```

**In components via hooks (when available):**

```tsx
import { useRouterContext } from '@equinor/fusion-framework-react-router';

export default function Page() {
  const { fusion } = useRouterContext();
  // fusion.modules and fusion.context are available
  return <div>{/* ... */}</div>;
}
```

---

## ESM-only builds

React Router v8 requires ESM. If your build is CommonJS-only, the router will fail to load at runtime.

### Detecting the problem

CommonJS-only builds show an error like:

```
ERR_REQUIRE_ESM: require() of ES Module not supported
```

Or at test time:

```
SyntaxError: Cannot use import statement outside a module
```

### Fixing CommonJS-only builds

**Option 1: Update to an ESM-first build tool (recommended)**

- **Vite** (recommended, modern default) — supports both ESM and CommonJS output
- **esbuild** — ESM-first, can output CommonJS if needed
- **swc** — similar to esbuild

**Option 2: Enable ESM in your existing build tool**

Most build tools support ESM output. Check your tool's docs:

- **Webpack**: set `output.module: true` (v5.89+) or use `output.format: 'module'`
- **Rollup**: set `format: 'es'`
- **tsup**: ESM is the default
- **tsc**: set `module: 'esnext'` in `tsconfig.json`

**Option 3: Use a test runner that supports ESM**

If you're running tests, ensure your runner supports ESM:

- **vitest** — ESM-first, recommended
- **@vitest/browser** — browser testing with vitest
- **Jest** with `--experimental-vm-modules` — limited ESM support

---

## Common questions

### Can I still use hooks like `useLoaderData` and `useParams`?

Yes. They are re-exported from `@equinor/fusion-framework-react-router` and work exactly as in React Router. The props-based API is optional and preferred for type safety.

### Can I mix `RouteObject[]` and the Fusion DSL?

Yes. `<Router>` accepts both. You can migrate route by route.

### What about `<Outlet />`, `<Link />`, `<NavLink />`?

All re-exported from `@equinor/fusion-framework-react-router`. No import changes needed beyond the source package.

### Do I need to change `element` to `Component` in my route objects?

Not immediately — both work in v8. However, `Component` is the new standard. Migrate when convenient.

### What happens to my error boundaries?

Error boundaries still work. Rename `errorElement` to `ErrorBoundary` in v8 if you prefer the new name, but `errorElement` still works for backwards compatibility.

### I have a test that uses `MemoryRouter`. Will it still work?

Yes. Use `import { MemoryRouter } from '@equinor/fusion-framework-react-router/interop'`. For new tests, consider using `createMemoryRouter` with full route objects so you can test loaders and actions.

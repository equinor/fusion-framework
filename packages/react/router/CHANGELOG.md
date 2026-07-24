# @equinor/fusion-framework-react-router

## 2.3.0

### Minor Changes

- 6a338f1: Expand re-exports so consumers don't need a direct `react-router` or `react-dom` import.

  **New exports from `react-router`:**
  - `BrowserRouter`
  - `createSearchParams`
  - `generatePath`
  - `isRouteErrorResponse`
  - `type PathParam`
  - `type SetURLSearchParams`

  **New `Router` prop:**
  - `useTransitions?: boolean` — forwarded to `RouterProvider`. Set to `false` to disable React transition wrapping on navigation state updates (workaround for route-change UI flashing).

  ```tsx
  // Disable transitions to suppress route-change flash
  <Router routes={routes} useTransitions={false} />
  ```

  Fixes: https://github.com/equinor/fusion/issues/880
  Thanks: @edmondbaloku for the report.

- bc05307: Fix `errorElement` typing and add `ErrorBoundary` support in `RouteObject`.

  **`errorElement`**: The type was incorrectly inherited from React Router as `ReactNode`, but the Fusion router has always required a `ComponentType` so it can inject `error` and `fusion` context as props. Passing a rendered element (`<MyError />`) compiled but failed at runtime. The type now correctly reflects the implementation.

  ```tsx
  // Before — compiled but crashed at runtime
  const routes = [
    { path: "/", element: <Home />, errorElement: <MyError /> },
  ] satisfies RouteObject[];

  // After — pass the component directly (no cast needed)
  const routes = [
    { path: "/", element: <Home />, errorElement: MyError },
  ] satisfies RouteObject[];
  ```

  **`ErrorBoundary`**: Previously silently ignored at runtime — the Fusion router replaced react-router's default `mapRouteProperties` entirely but never converted `ErrorBoundary` to `errorElement` or set `hasErrorBoundary`, so react-router never registered the boundary. Now works correctly: the component is wrapped to inject `error` and `fusion` as props and then converted to `errorElement` internally, matching react-router's own default behaviour.

  ```tsx
  const routes = [
    { path: "/", element: <Home />, ErrorBoundary: MyError },
  ] satisfies RouteObject[];
  ```

  **`ErrorElementProps` / `ErrorElement`**: The default `TError` type changed from `Error` to `unknown`, which is more accurate since React Router can throw any value (strings, response objects, etc.). Narrow the error type in your component if needed.

  ```tsx
  // Explicit type param still works as before
  function MyError({ error }: ErrorElementProps<Error>) {
    return <p>{error.message}</p>;
  }
  ```

  Fixes: https://github.com/equinor/fusion/issues/863
  Thanks @AndreasPresthammer for the detailed repro.

### Patch Changes

- 739adc9: Add `shouldRevalidate` support to the file-route Vite plugin.

  The Vite plugin now detects and wires a `shouldRevalidate` named export from route files into the generated React Router data route. This allows apps to control whether a route re-runs its loader after a navigation or action — for example to prevent revalidation on search-parameter-only changes.

  ```ts
  // src/pages/ProductsPage.tsx
  import type { ShouldRevalidateFunctionArgs } from 'react-router';

  export function shouldRevalidate({ currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {
    // Only revalidate when the path segment changes, not on search param updates
    return currentUrl.pathname !== nextUrl.pathname;
  }

  export default function ProductsPage() { ... }
  ```

  Reported by: @yusijs in equinor/fusion#870
  Closes: https://github.com/equinor/fusion-core-tasks/issues/1631

- 6694431: Document all supported file-route exports for the React Router Vite plugin.

  The `README.md`, `BaseFileRoute` class, and `getAvailableExports` in the Vite plugin now carry a complete reference table of the six named exports the plugin recognises and wires into the generated React Router data route:

  | Export            | Mapped to         |
  | ----------------- | ----------------- |
  | `default`         | `Component`       |
  | `clientLoader`    | `loader`          |
  | `action`          | `action`          |
  | `handle`          | `handle`          |
  | `ErrorElement`    | `errorElement`    |
  | `HydrateFallback` | `HydrateFallback` |

  The README was also updated to fix incorrect prerequisites (Fusion packages are bundled dependencies, not peer dependencies), clarify the `/context` entry point, and add GFM alert callouts for common gotchas (navigation module configuration, file-path resolution, Vite plugin being required for code-splitting).

  Reported by: @yusijs in https://github.com/equinor/fusion/issues/870
  Closes: https://github.com/equinor/fusion-core-tasks/issues/1630

## 2.2.0

### Minor Changes

- e4969db: Add `./interop` entry point with curated deprecated re-exports of `react-router` symbols.

  Teams that are mid-migration from `react-router` to `@equinor/fusion-framework-react-router`, or
  that need `MemoryRouter` for testing and widget scenarios, can now import these symbols without
  adding `react-router` as a direct dependency — which risks dual-bundling when the Fusion router is
  also present.

  **Exported symbols** (all marked `@deprecated` — interop only, will be removed in a future major):

  ```ts
  import {
    MemoryRouter,
    RouterProvider,
    createMemoryRouter,
    Routes,
    Route,
  } from "@equinor/fusion-framework-react-router/interop";
  ```

  **Typical use cases:**

  ```tsx
  // Testing with a memory router
  import { MemoryRouter } from "@equinor/fusion-framework-react-router/interop";

  render(
    <MemoryRouter initialEntries={["/products/42"]}>
      <ProductPage />
    </MemoryRouter>,
  );

  // Widget / SSR — no window available
  import {
    createMemoryRouter,
    RouterProvider,
  } from "@equinor/fusion-framework-react-router/interop";

  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  root.render(<RouterProvider router={router} />);
  ```

  These exports are a temporary bridge. Migrate to `@equinor/fusion-framework-react-router` fully
  and remove the `/interop` import once your team is ready.

### Patch Changes

- f3bf74b: Fix blank page and broken back/forward navigation under React StrictMode.

  `router.initialize()` was previously called during render (inside `useMemo`), which creates history listener side effects before React's commit phase. In StrictMode, React intentionally mounts, unmounts, and remounts components in development, which left stale initialized router instances with dangling history subscriptions. This caused `navigation.navigate()` to update the URL without the app router reacting, and browser back/forward to produce a blank page.

  The router is now initialized and disposed inside a `useEffect`, matching React's expected side-effect lifecycle. A `loader` prop (already accepted by `RouterProps`) is rendered as a fallback during the brief initialization window.

  Readiness is tied to the active router instance identity so a newly recreated router is never rendered before its own initialization effect has completed.

  Fixes: https://github.com/equinor/fusion/issues/848

## 2.1.0

### Minor Changes

- a5dc246: Expose `Routes` and `Route` as public exports from `@equinor/fusion-framework-react-router` for compatibility, and mark them as deprecated in favor of the Fusion route DSL or `RouteObject`-based routing.

## 2.0.2

### Patch Changes

- 51e6e50: Internal: bump `react-router` from `7.13.2` to `7.14.2`.

## 2.0.1

### Patch Changes

- d2ff4fd: Export `useResolvedPath` from `react-router`

## 2.0.0

### Major Changes

- 8aa1eb0: Remove exports from `react-router` that users should not use in implementation.

  Breaking Changes: Removes `RouterProvider`, users should use `Router` instead.

## 1.2.3

### Patch Changes

- 538725c: External: re-export additional React Router symbols that apps may require to operate without needing `react-router` installed.

  Internal: sort barrel exports in the router package index for deterministic ordering; this sorting change does not change runtime behavior or the public API.

## 1.2.2

### Patch Changes

- 90313fa: Internal: Bump `@react-router/dev` from 7.13.2 to 7.14.1 (adds Vite 8 and TypeScript 6 support).
- 4f71408: Internal: Bump `react-router` from 7.13.2 to 7.14.1.

## 1.2.1

### Patch Changes

- b733f91: Export `RouterProviderProps` type from `react-router` for consumer use.

## 1.2.0

### Minor Changes

- 46cea46: Export `LinkProps` from the package root so consumers can type link wrappers and related helpers without importing directly from `react-router`.

## 1.1.0

### Minor Changes

- 88a5455: Export `Navigate` from the package root so consumers can import router primitives directly from `@equinor/fusion-framework-react-router`.

## 1.0.2

### Patch Changes

- 3c284b4: Fix blank page caused by route object mutation and stale router context.
  - **Route mutation**: `mapRouteProperties` now shallow-clones each route before wrapping loaders, actions, and components. Previously it mutated the original objects, causing double-wrapping on router recreation.
  - **Stale context**: The Fusion router context is now stored in a ref and read lazily via `getContext()`, so context updates no longer destroy and recreate the entire router instance (which lost navigation state).
  - **Router cleanup**: The router is now disposed on unmount or recreation, preventing leaked history listeners from routing into a stale instance.
  - **Single-route input**: A single `RouteNode` passed as the `routes` prop is now correctly normalized into an array.

## 1.0.1

### Patch Changes

- 93377c5: Fix white screen when using `clientLoader` by adding `HydrateFallback` support.

  The Vite plugin now recognizes the `HydrateFallback` export from route files and wires it as the `HydrateFallback` component on the route object. Previously, even if a route file exported `HydrateFallback`, the plugin ignored it, causing React Router v7 to render nothing while loaders ran.

  Closes #4242

## 1.0.0

### Major Changes

- abffa53: Major version bump for Fusion Framework React 19 release.

  All packages are bumped to the next major version as part of the React 19 upgrade. This release drops support for React versions below 18 and includes breaking changes across the framework.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React Router upgraded from v6 to v7
  - Navigation module refactored with new history API
  - `renderComponent` and `renderApp` now use `createRoot` API

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading
  - Replace `NavigationProvider.createRouter()` with `@equinor/fusion-framework-react-router`
  - See individual package changelogs for package-specific migration steps

- abffa53: Upgrade to React 19 and remove support for React versions lower than 18.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React 16 and 17 are no longer supported
  - Dev dependencies upgraded to React 19.2.1 and @types/react 19.2.7

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading these packages
  - If using React 16 or 17, upgrade to React 18 or 19 first

  Closes https://github.com/equinor/fusion-framework/issues/3504

- abffa53: Add new React Router package with DSL API for React Router v7 routes.

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

### Patch Changes

- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
  - @equinor/fusion-framework-module-navigation@7.0.0
  - @equinor/fusion-framework-react-module@4.0.0
  - @equinor/fusion-imports@2.0.0

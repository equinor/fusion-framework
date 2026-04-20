# @equinor/fusion-framework-react-router

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

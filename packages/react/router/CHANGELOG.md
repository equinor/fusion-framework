# @equinor/fusion-framework-react-router

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

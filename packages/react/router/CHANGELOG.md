# @equinor/fusion-framework-react-router

## 1.0.0-next.1

### Patch Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`c787fc6`](https://github.com/equinor/fusion-framework/commit/c787fc6b6db2b2837ec863125220feffca7240ab)]:
  - @equinor/fusion-framework-react-module@4.0.0-next.1
  - @equinor/fusion-framework-module-navigation@7.0.0-next.2
  - @equinor/fusion-imports@1.1.11-next.0

## 1.0.0-next.0

### Major Changes

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`75c068f`](https://github.com/equinor/fusion-framework/commit/75c068fea13c32435ac26bd9043cc156482bfaf1) Thanks [@odinr](https://github.com/odinr)! - Upgrade to React 19 and remove support for React versions lower than 18.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React 16 and 17 are no longer supported
  - Dev dependencies upgraded to React 19.2.1 and @types/react 19.2.7

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading these packages
  - If using React 16 or 17, upgrade to React 18 or 19 first

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8) Thanks [@odinr](https://github.com/odinr)! - Add new React Router package with DSL API for React Router v7 routes.

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

- [#3820](https://github.com/equinor/fusion-framework/pull/3820) [`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b) Thanks [@odinr](https://github.com/odinr)! - relase next

- Updated dependencies [[`265bb76`](https://github.com/equinor/fusion-framework/commit/265bb767249989eeb1971e83f3fba94879e0813b), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8), [`d252b0d`](https://github.com/equinor/fusion-framework/commit/d252b0d442b7c8c1b50bf2768cf9ecbbb55a76f8), [`9f7597e`](https://github.com/equinor/fusion-framework/commit/9f7597ee237ef069dc24cbe39c73b5b26db157dd), [`75c068f`](https://github.com/equinor/fusion-framework/commit/75c068fea13c32435ac26bd9043cc156482bfaf1)]:
  - @equinor/fusion-framework-react-module@4.0.0-next.0
  - @equinor/fusion-framework-module-navigation@7.0.0-next.1
  - @equinor/fusion-imports@1.2.0-next.0

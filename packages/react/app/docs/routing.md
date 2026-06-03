# Routing

The `@equinor/fusion-framework-react-app/routing` entry point re-exports the full public API of
`@equinor/fusion-framework-react-router` — including the `<Router>` component, the route builder
DSL, all React Router hooks, and types — so you can import everything from a single package without
adding `@equinor/fusion-framework-react-router` as a direct dependency.

## Installation

`@equinor/fusion-framework-react-router` is an **optional peer dependency**. Install it alongside the app package:

```bash
pnpm add @equinor/fusion-framework-react-router
```

## Usage

```ts
import { Router } from '@equinor/fusion-framework-react-app/routing';
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-app/routing';
```

Everything exported from `@equinor/fusion-framework-react-router` and its `/routes` DSL is
available from this single entry point.

## Enable navigation in your configurator

The `<Router>` component reads `history` and `basename` from the Fusion navigation module.
Enable it in your configurator before mounting:

```ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { IAppConfigurator, AppEnv, Fusion } from '@equinor/fusion-framework-react-app';

export const configure = (
  configurator: IAppConfigurator,
  args: { fusion: Fusion; env: AppEnv },
) => {
  enableNavigation(configurator, {
    configure: (config) => {
      config.setBasename(args.env.basename);
    },
  });
};
```

## Define routes

```ts
// src/routes.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-app/routing';

export default layout('./Layout.tsx', [
  index('./pages/HomePage.tsx'),
  prefix('products', [
    index('./pages/ProductsPage.tsx'),
    route(':id', './pages/ProductPage.tsx'),
  ]),
]);
```

## Mount the Router

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-app/routing';
import routes from './routes';

export default function AppRouter() {
  return <Router routes={routes} />;
}
```

## Use routing hooks

All React Router hooks are re-exported from the same entry point:

```tsx
import { useNavigate, useParams, useLocation, Link } from '@equinor/fusion-framework-react-app/routing';
```

## See also

- [Getting started](../../react/router/getting-started.md) — full setup walkthrough for the standalone router package
- [Interop entry point](../../react/router/interop.md) — `MemoryRouter` and other react-router bridges for testing and mid-migration
- [Migration guide](../../react/router/migration.md) — moving from a plain react-router setup

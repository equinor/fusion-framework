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

## Typed route middleware

Use `createMiddleware` to infer the router's request, signal, Fusion context and
continuation types:

```ts
import { createMiddleware } from '@equinor/fusion-framework-react-app/routing';

export const middleware = [
  createMiddleware(async ({ signal }, next) => {
    signal.throwIfAborted();
    return next();
  }),
];
```

The router-owned factory is re-exported through the app routing entry point and
returns the same function without wrapping execution. Specify
`createMiddleware<Params, FusionContext, Result>(...)` for specialized route
parameters, application context or downstream results.

## Role-gated routes

Enable the Roles module in your app, then declare the route's requirements:

```ts
import { requireRoles } from '@equinor/fusion-framework-react-app/roles';

export const middleware = [requireRoles(['Reports.Read'])];
```

All listed roles are required by default. Pass `{ mode: 'any' }` as the second
argument to accept any one role. No app-owned guard implementation or custom
context types are needed. Put middleware on a layout to protect its children;
every matched parent and child gate must pass.

Denial and provider errors stop the middleware chain; cancelled operations cannot
continue. The guard checks the router middleware contract at compile time.
Roles-only consumers do not gain a router runtime or declaration dependency.
The router and core Roles module do not gain new dependencies.

Client role gates protect navigation and UI only; backend endpoints must still
authorize every request.

## See also

- [Getting started](/modules/react/router/getting-started) — full setup walkthrough for the standalone router package
- [Interop entry point](/modules/react/router/interop) — `MemoryRouter` and other react-router bridges for testing and mid-migration
- [Migration guide](/modules/react/router/migration) — moving from a plain react-router setup
- [Roles V2 adoption](/guide/app/docs/roles-v2-adoption-guide) — enabling Roles and handling access requirements

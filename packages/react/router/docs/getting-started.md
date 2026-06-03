# Getting started with `@equinor/fusion-framework-react-router`

This guide walks through setting up routing in any Fusion Framework React consumer — apps, portals, widgets, or any other Fusion-enabled context.

## Prerequisites

- A Fusion Framework React consumer (app, portal, widget, etc.) with access to the Fusion module system
- `@equinor/fusion-framework-module-navigation` enabled in your configurator (bundled with the framework)

## Installation

```bash
pnpm add @equinor/fusion-framework-react-router
```

## Step 1 — Enable navigation in your configurator

The router reads `history` and `basename` from the Fusion navigation module. Enable it in your configurator:

```ts
// src/config.ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { IConfigurator } from '@equinor/fusion-framework';

export const configure = (configurator: IConfigurator) => {
  enableNavigation(configurator, {
    configure: (config) => {
      // Set the basename to scope routing to a sub-path.
      // For apps this is typically the app's assigned path segment;
      // for portals it may be '/' or a portal-specific prefix.
      config.setBasename('/');
    },
  });
};

export default configure;
```

> **App consumers** can read `basename` from the app environment:
> ```ts
> import type { IAppConfigurator, AppEnv, Fusion } from '@equinor/fusion-framework-react-app';
> export const configure = (configurator: IAppConfigurator, args: { fusion: Fusion; env: AppEnv }) => {
>   enableNavigation(configurator, { configure: (c) => c.setBasename(args.env.basename) });
> };
> ```

## Step 2 — Define your routes

Use the Fusion route DSL to build your route tree. Each entry points to a page module file resolved at build time by the Vite plugin.

```ts
// src/routes.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export default layout('./Layout.tsx', [
  index('./pages/HomePage.tsx'),
  prefix('products', [
    index('./pages/ProductsPage.tsx'),
    route(':id', './pages/ProductPage.tsx'),
  ]),
]);
```

Alternatively, pass a plain `RouteObject[]` array if you prefer not to use the DSL:

```ts
import type { RouteObject } from '@equinor/fusion-framework-react-router';

export const routes: RouteObject[] = [
  { path: '/', Component: HomePage },
  { path: '/products/:id', Component: ProductPage },
];
```

## Step 3 — Mount the Router

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import routes from './routes';

export default function AppRouter() {
  return <Router routes={routes} />;
}
```

`<Router>` wires up `history` and `basename` from the navigation module automatically. No manual `createBrowserRouter` or `RouterProvider` setup required.

## Step 4 — Write page components

Page components receive `loaderData`, `actionData`, and `fusion` as props:

```tsx
// src/pages/ProductPage.tsx
import type { LoaderFunctionArgs, RouteComponentProps } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ params, fusion }: LoaderFunctionArgs<{ id: string }>) {
  const client = fusion.modules.http.createHttpClient('products');
  return client.json<{ name: string }>(`/products/${params.id}`);
}

export default function ProductPage({ loaderData }: RouteComponentProps<{ name: string }>) {
  return <h1>{loaderData.name}</h1>;
}
```

## Step 5 — Use navigation hooks

All standard React Router hooks are re-exported from the Fusion router package:

```tsx
import { useNavigate, useParams, useLocation, Link } from '@equinor/fusion-framework-react-router';
```

No direct `react-router` import needed in your app code.

## Step 6 — (Optional) Pass custom context

If you need to share state (e.g. a query client or API class) across all loaders and components, extend `RouterContext` and pass the value to `<Router>`:

```ts
// src/router-context.d.ts
declare module '@equinor/fusion-framework-react-router' {
  interface RouterContext {
    queryClient: import('@tanstack/react-query').QueryClient;
  }
}
```

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { QueryClient } from '@tanstack/react-query';
import routes from './routes';

const queryClient = new QueryClient();

export default function AppRouter() {
  return <Router routes={routes} context={{ queryClient }} />;
}
```

Access it in loaders and components via `fusion.context.queryClient`.

## Step 7 — (Optional) Enable the Vite plugin

The Vite plugin transforms DSL calls into optimised React Router `RouteObject` code at build time, enabling proper code splitting for lazy routes:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactRouterPlugin } from '@equinor/fusion-framework-react-router/vite-plugin';

export default defineConfig({
  plugins: [react(), reactRouterPlugin()],
});
```

## Next steps

- [Migration guide](./migration.md) — moving from a plain `react-router` setup
- [Interop entry point](./interop.md) — `MemoryRouter`, `createMemoryRouter`, and JSX-based routing for testing and mid-migration scenarios
- [End-to-end cookbook](/cookbooks/react-app-router) — full working example

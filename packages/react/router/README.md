# @equinor/fusion-framework-react-router

Integration layer between [React Router v7](https://reactrouter.com/) and the Fusion Framework. Provides automatic navigation module wiring, typed `fusion` context injection into loaders, actions, and components, a file-style route DSL, and manifest-ready route schemas.

## Features

- **Fusion navigation integration** — reads `history` and `basename` from the Fusion navigation module automatically.
- **Typed `fusion` context everywhere** — loaders, actions, components, and error elements receive `fusion.modules` and `fusion.context` without threading props or React contexts.
- **File-style route DSL** — `layout`, `index`, `route`, `prefix` helpers replace hand-built `RouteObject` trees.
- **Route schema generation** — `handle.route` metadata can be turned into a flat, machine-readable schema for manifests, portals, and documentation.
- **Module augmentation** — extend `RouterContext` and `RouterHandle` to type your own context and handle fields.
- **Vite plugin** — statically transforms DSL calls into optimised React Router data routes at build time.

## Installation

```bash
pnpm add @equinor/fusion-framework-react-router
```

**Prerequisites**

- React 18+ / React DOM 18+
- `@equinor/fusion-framework-react-module`
- `@equinor/fusion-framework-module-navigation` configured in your app

## Quick start

### 1. Define page modules

Each page module exports a default component. Optionally export `clientLoader`, `action`, `handle`, and `ErrorElement`.

```tsx
// src/pages/ProductPage.tsx
import type {
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    description: 'Product page',
    params: { id: 'Product identifier' },
  },
} satisfies RouterHandle;

export async function clientLoader({ params, fusion }: LoaderFunctionArgs<{ id: string | undefined }>) {
  const client = fusion.modules.http.createHttpClient('products');
  return client.json(`/products/${params.id}`);
}

export default function ProductPage({ loaderData }: RouteComponentProps<{ name: string }>) {
  return <h1>{loaderData.name}</h1>;
}
```

### 2. Build the route tree

```ts
// src/pages/index.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout('./MainLayout.tsx', [
  index('./HomePage.tsx'),
  prefix('products', [
    index('./ProductsPage.tsx'),
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

### 3. Mount the Router

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { pages } from './pages';

export default function AppRouter() {
  return <Router routes={pages} />;
}
```

### Passing custom context

```ts
// router-context.d.ts
declare module '@equinor/fusion-framework-react-router' {
  interface RouterContext {
    queryClient: import('@tanstack/react-query').QueryClient;
  }
}
```

```tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { QueryClient } from '@tanstack/react-query';
import { pages } from './pages';

const queryClient = new QueryClient();
export default function AppRouter() {
  return <Router routes={pages} context={{ queryClient }} />;
}
```

Loaders and components then access `fusion.context.queryClient` with full type safety.

### Generating route schemas

```ts
import { toRouteSchema } from '@equinor/fusion-framework-react-router/schema';
import { pages } from './pages';

const schema = await toRouteSchema(pages);
```

### Vite plugin

```ts
// vite.config.ts
import { reactRouterPlugin } from '@equinor/fusion-framework-react-router/vite-plugin';

export default defineConfig({
  plugins: [react(), reactRouterPlugin()],
});
```

## Entry points

| Entry point | Purpose |
|---|---|
| `@equinor/fusion-framework-react-router` | Main — `Router`, hooks, types, and React Router re-exports |
| `/routes` | Route DSL — `layout`, `index`, `route`, `prefix` |
| `/schema` | Schema generation — `toRouteSchema` |
| `/context` | Internal context — `routerContext`, `FusionRouterContextProvider`, `useRouterContext` |
| `/vite-plugin` | Vite build plugin |
| `/interop` | Interop re-exports for teams mid-migration — see [docs/interop.md](docs/interop.md) |

## Documentation

- [Migration guide — from `react-router` to Fusion router](docs/migration.md)
- [Interop entry point](docs/interop.md)
- [End-to-end cookbook](../../../cookbooks/app-react-router/)


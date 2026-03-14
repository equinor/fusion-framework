# @equinor/fusion-framework-react-router

Thin integration layer between [React Router v7](https://reactrouter.com/) and the Fusion Framework. It adds Fusion-specific behaviour — navigation module wiring, typed `fusion` context injection, a file-style route DSL, and manifest-ready route schemas — while keeping the full power of React Router.

## Features

- **Fusion navigation integration** — reads `history` and `basename` from the Fusion navigation module automatically.
- **Typed `fusion` context everywhere** — loaders, actions, components, and error elements receive `fusion.modules` and `fusion.context` without threading props or React contexts.
- **File-style route DSL** — `layout`, `index`, `route`, `prefix` helpers replace hand-built `RouteObject` trees.
- **Route schema generation** — `handle.route` metadata can be turned into a flat, machine-readable schema for manifests, portals, and documentation.
- **Module augmentation** — extend `RouterContext` and `RouterHandle` to type your own context and handle fields.
- **Vite plugin** — statically transforms DSL calls into optimised React Router data routes at build time.

## Installation

```bash
pnpm add @equinor/fusion-framework-react-router react-router-dom
```

### Prerequisites

- React 18+ / React DOM 18+
- React Router v7 (`react-router` / `react-router-dom`)
- `@equinor/fusion-framework-react-module`
- `@equinor/fusion-framework-module-navigation` configured in your app

## Usage

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
    search: { filter: 'Product type filter' },
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

### 2. Build the route tree with the DSL

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

Extend `RouterContext` via module augmentation, then pass the context to `<Router>`:

```ts
// router-context.d.ts
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
// => [['/', 'Home page'], ['products/:id', 'Product page', { params: { id: 'Product identifier' } }]]
```

### Vite plugin

Enable the DSL transform so route definitions are rewritten to standard `RouteObject` code at build time:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactRouterPlugin } from '@equinor/fusion-framework-react-router/vite-plugin';

export default defineConfig({
  plugins: [react(), reactRouterPlugin()],
});
```

## API Reference

### Components

| Export | Description |
|---|---|
| `Router` | Integrates React Router v7 with Fusion Framework. Accepts `routes`, optional `loader`, and optional `context`. |

### Hooks & Context

| Export | Description |
|---|---|
| `useRouterContext()` | Returns the current `FusionRouterContext` (`modules` + `context`). Throws if used outside `<Router>`. |
| `routerContext` | React Router context key used internally to pass the Fusion context to loaders and actions. |
| `FusionRouterContextProvider` | React context provider for `FusionRouterContext`. Used internally by `<Router>`. |

### Route DSL (`/routes` entry point)

| Export | Description |
|---|---|
| `layout(file, children)` | Layout route wrapping children with a shared component containing `<Outlet />`. |
| `index(file, schema?)` | Index route rendered at the parent's path. |
| `route(path, file, children?, schema?)` | Standard route with a URL path and optional children. |
| `prefix(path, children)` | Path-only grouping — prepends a segment to children without rendering a component. |

### Schema (`/schema` entry point)

| Export | Description |
|---|---|
| `toRouteSchema(nodes)` | Converts a route tree (DSL nodes or legacy `RouteObject[]`) to a flat `RouteSchemaEntry[]`. |

### Vite Plugin (`/vite-plugin` entry point)

| Export | Description |
|---|---|
| `reactRouterPlugin(options?)` | Vite plugin that transforms DSL calls into React Router `RouteObject` code at build time. |

### Key Types

| Type | Description |
|---|---|
| `FusionRouterContext` | Object containing `modules` (Fusion modules instance) and `context` (custom context). |
| `RouterContext` | Extensible interface for custom context (extend via module augmentation). |
| `RouterHandle` | Handle interface with `route: RouterSchema` and extensible custom fields. |
| `RouterSchema` | Schema with `description`, `params`, and `search` for a single route. |
| `RouteComponentProps<TData, TActionData>` | Props received by route components: `loaderData`, `actionData`, `fusion`. |
| `LoaderFunctionArgs<TParams>` | Arguments passed to `clientLoader` functions. |
| `ActionFunctionArgs<TParams>` | Arguments passed to `action` functions. |
| `ErrorElementProps<TError>` | Props received by error boundary components: `error`, `fusion`. |
| `RouteNode` | Base interface for DSL route nodes. |
| `RouteSchemaEntry` | Tuple format: `[path, description]` or `[path, description, { params?, search? }]`. |

## Configuration

The `<Router>` component reads `history` and `basename` from the Fusion navigation module. Ensure your app configures `@equinor/fusion-framework-module-navigation` before mounting the router.

For the Vite plugin, pass `{ debug: true }` to `reactRouterPlugin()` to enable verbose transformation logging during development.

For a complete end-to-end example, see the [`cookbooks/app-react-router`](../../../cookbooks/app-react-router/) cookbook.

# @equinor/fusion-framework-react-router

Opinionated React Router v7 integration for Fusion Framework applications. Rather than wiring up navigation history, basename, and request context by hand, this package does it for you and surfaces everything as a typed `fusion` object inside every loader, action, and component.

The package ships three things that work together:

- **`Router` component** — drop-in replacement for `RouterProvider`. Reads `history` and `basename` from the Fusion navigation module and injects `fusion.modules` and `fusion.context` into every route.
- **File-route DSL** — `layout`, `index`, `route`, and `prefix` helpers that build a `RouteObject` tree from file paths instead of raw objects. The Vite plugin transforms them into lazy-loaded data routes at build time.
- **Route schema generation** — `toRouteSchema` converts `handle.route` metadata into a flat, machine-readable manifest. Useful for portal navigation trees and app documentation.

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

- React 18+ (`react` is a required peer dependency)
- `react-dom` 18+ (optional peer dependency, required for browser rendering)

All other Fusion Framework packages (`@equinor/fusion-framework-module-navigation`, `@equinor/fusion-framework-react-module`) are bundled dependencies — they install automatically.

> [!IMPORTANT]
> Installing `@equinor/fusion-framework-module-navigation` is not enough. It must also be **enabled in your app's configurator** via `enableNavigation(configurator, ...)`. `Router` reads `history` and `basename` from the module at runtime and will throw if the module is not present.
> See the [getting started guide](docs/getting-started.md) for the full configurator setup.

## Quick start

> [!NOTE]
> The examples below skip the Fusion app configurator setup. See the [getting started guide](docs/getting-started.md) for full setup instructions.

### 1. Define page modules

A page module is a plain TypeScript or TSX file that React Router loads lazily when its route is matched. Export a default component to render the page. The Vite plugin scans each file for additional named exports and wires them in automatically — you do not need to register them anywhere.

The following named exports are recognised:

| Export | Description |
|---|---|
| `default` | **Required.** The page component. |
| `clientLoader` | Route loader — called before render, receives `fusion` context. |
| `action` | Route action — handles form submissions and mutations. |
| `handle` | Route handle metadata, available via `useMatches()`. |
| `ErrorElement` | Error boundary component rendered when the route throws. |
| `HydrateFallback` | Shown during hydration while `clientLoader` resolves. |
| `shouldRevalidate` | Controls whether the route re-runs its loader after navigation or an action. Return `false` to suppress revalidation. |

> [!NOTE]
> Any other named export is silently ignored by the plugin. You can co-locate utilities, hooks, and helpers in the same file without side effects.

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

The route DSL lets you describe a `RouteObject` tree using file paths instead of importing every component up front. `layout` wraps children in a shared component (header, nav, shell), `index` declares the default child route, `route` maps a path segment to a file, and `prefix` groups routes under a common segment without a layout component.

> [!TIP]
> File paths are resolved **relative to the file that calls them**, not the project root. `'./ProductPage.tsx'` in `src/pages/index.ts` resolves to `src/pages/ProductPage.tsx`.

> [!CAUTION]
> Use `prefix` when you only need to group routes under a URL segment. Use `layout` only when those routes also share a wrapper component. Wrapping in a `layout` without a real layout file adds an unnecessary render boundary.

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

`Router` is a thin wrapper around React Router's `RouterProvider`. It reads `history` and `basename` from the Fusion navigation module so you do not have to configure them manually. Pass the route tree from step 2 as `routes`.

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { pages } from './pages';

export default function AppRouter() {
  return <Router routes={pages} />;
}
```

### Passing custom context

The `fusion` object available in loaders, actions, and components always contains `fusion.modules`. If you also need to pass application-level dependencies — a query client, an API instance, environment config — add them to `fusion.context` using TypeScript module augmentation and the `context` prop on `Router`.

Declare additional properties on `RouterContext` in a `.d.ts` file:

> [!TIP]
> Put the augmentation in a `.d.ts` file (e.g. `router-context.d.ts`) that TypeScript picks up via your `tsconfig.json` `include` glob, **not** inside a regular `.ts` file that imports from the package. Placing it in a `.ts` file can create circular type dependencies.

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

`toRouteSchema` walks the route tree and converts each `handle.route` object into a flat list of route descriptors. The output is a machine-readable manifest that portals and documentation tools can consume — for example to populate a navigation sidebar or register app routes with a portal registry.

```ts
import { toRouteSchema } from '@equinor/fusion-framework-react-router/schema';
import { pages } from './pages';

const schema = await toRouteSchema(pages);
```

### Vite plugin

The Vite plugin is optional but strongly recommended when using the file-route DSL. At build time it resolves each file reference in your route tree, detects which named exports are present (`clientLoader`, `action`, `handle`, etc.), and rewrites the DSL calls to standard React Router lazy data routes.

> [!WARNING]
> Without the Vite plugin, **the file-route DSL does not work**. The DSL objects (`layout`, `route`, `index`, etc.) carry only a `file` path string — they have no `Component`, `loader`, or `action` wired in. The Vite plugin performs that transformation at build time. Without it, routes will render blank pages. Code-splitting is an additional benefit, not the primary one.

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
| `@equinor/fusion-framework-react-router` | Main — `Router`, hooks, context helpers, types, and React Router re-exports |
| `/routes` | Route DSL — `layout`, `index`, `route`, `prefix` |
| `/schema` | Schema generation — `toRouteSchema` |
| `/context` | Direct context imports — same `routerContext`, `FusionRouterContextProvider`, `useRouterContext` as main; use when you need to import without pulling in `Router` (e.g. tests, custom providers) |
| `/vite-plugin` | Vite build plugin |
| `/interop` | Interop re-exports for teams mid-migration — see [docs/interop.md](docs/interop.md) |

## Documentation

- [Migration guide — from `react-router` to Fusion router](docs/migration.md)
- [Interop entry point](docs/interop.md)
- [End-to-end cookbook](../../../cookbooks/app-react-router/)


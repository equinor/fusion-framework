## Fusion React Router

Fusion React Router (`@equinor/fusion-framework-react-router`) is a **thin integration layer on top of [React Router v7](https://reactrouter.com/)**.

It keeps all the power of React Router, but adds Fusion‑specific behaviour:

- **Fusion integration** – uses the **Fusion navigation module** for `history` and `basename`.
- **File‑style route DSL** – `layout`, `index`, `route`, `prefix` helpers instead of hand‑built `RouteObject` trees.
- **`fusion` context everywhere** – loaders, actions, components, and error elements receive Fusion modules and your custom context.
- **Route schema support** – `handle.route` metadata can be turned into a schema for manifests and documentation.

Use this package when you build Fusion apps that should:

- Use the Fusion navigation module for controlled navigation and history.
- Share services (APIs, `QueryClient`, app‑level `Api` object) across routes via a single router context.
- Reuse route metadata (`handle.route`) in **manifests, documentation, and navigation UIs**.

> [!IMPORTANT]
> **Key capabilities this package adds on top of React Router**  
> - **RouterContext injection**: Every loader, action, component, and error element receives a strongly‑typed `fusion` object. This bundles Fusion modules (`fusion.modules`) *and* your own app context (`fusion.context`), so features like HTTP clients, an `Api` façade, or a shared `QueryClient` are available everywhere without threading props or React contexts.  
> - **Manifest‑ready route schema**: The DSL + `handle.route` metadata can be turned into a compact schema that tools can read *without executing your app*. Portals, widgets, or chatbots can use this to resolve URL slugs and search parameters up front (e.g. “show me open positions for contract DK‑1 on project offshore wind” → deep link to `/projects/3c6d8f4b-1a2b-4c5d-9e7f-8a9b0c1d2e3f/contracts/8d7f2e7b-4c9a-4e32-bb0f-2f1b8d9f3e21/open-positions?status=open`) before they ever mount the React tree.

For a complete, end‑to‑end example, see the `cookbooks/app-react-router` cookbook.

### Why this package exists

You could wire React Router directly into a Fusion app, but you would have to:

- Manually connect React Router to the Fusion navigation module.
- Thread modules, HTTP clients, and app services through React contexts or props.
- Keep route metadata for manifests/docs in a separate structure.

Fusion React Router solves this by:

- Owning the **single integration point** between React Router and Fusion (`<Router />`).
- Injecting a **typed `fusion` object** into loaders, actions, components, and error elements.
- Providing a **small DSL** and **schema tools** so routes, docs, and manifests stay in sync.

### When should you use it?

Use `@equinor/fusion-framework-react-router` when:

- You are building a **Fusion app** that already uses `@equinor/fusion-framework-module-navigation`.
- You want to define routes with a **file‑based DSL** and keep route metadata in one place.
- You plan to integrate with **Fusion app manifests**, portals, or documentation tooling.

If you only need plain React Router in a non‑Fusion app, use React Router directly instead.

---

## Getting started

Fusion React Router is designed to run **inside a Fusion app** that already uses Fusion modules.

### Installation

- **Runtime requirements**
  - React 18+ and React DOM 18+
  - React Router v7 (`react-router` / `react-router-dom`)
- **Fusion dependencies**
  - `@equinor/fusion-framework-react-module`
  - `@equinor/fusion-framework-module-navigation`

Install the router alongside React Router:

```bash
pnpm add @equinor/fusion-framework-react-router react-router-dom
```

> [!IMPORTANT]
> The router reads `history` and `basename` from the Fusion navigation module, so make sure your app configuration includes `@equinor/fusion-framework-module-navigation`.

> [!TIP]
> Future versions of Fusion will configure the navigation module for you, but for now the router assumes apps are still self‑configuring. This keeps the rollout incremental and avoids breaking existing implementations.

### Recommended project structure

A small, conventional structure looks like this:

```text
src/
  pages/
    MainLayout.tsx
    HomePage.tsx
    ProductsPage.tsx
    ProductPage.tsx
    index.ts          # route DSL definition (pages array)
  routes.ts           # top-level route tree
  Router.tsx          # mounts <Router />
```

- **Page modules** live in `src/pages`, one file per route.
- The **route DSL** (`layout`, `index`, `route`, `prefix`) lives in `src/pages/index.ts`.
- The app has a single `Router` component in `src/Router.tsx` that wires everything to Fusion.

> [!TIP]
> Using `routes.ts` at the app root as the single exported route tree makes it a natural future hook for the framework to auto‑wire the router and generate route manifest data without extra configuration.

---

## Quick start

This section shows the **smallest realistic setup**: a layout, a couple of pages, one page with data loading + actions, and the `Router` wired into Fusion.

- If you already know React Router, skim the code and focus on where `fusion` and the DSL helpers (`layout`, `index`, `route`, `prefix`) show up.
- If you are new to Fusion, read the bullets under each step – they explain what is required vs. optional.

### 1. Define pages

Pages are just React modules. The only requirement is that they export a **default component**; everything else (`handle`, `clientLoader`, `action`) is optional and can be added gradually as you need it.

```tsx
// src/pages/MainLayout.tsx
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div>
      <h1>My App</h1> {/* Static header shown on every page */}
      <Outlet /> {/* Child routes render here */}
    </div>
  );
}

// src/pages/HomePage.tsx
export default function HomePage() {
  return <h2>Home</h2>; // Simple landing page
}

// src/pages/ProductsPage.tsx
export default function ProductsPage() {
  return <h2>Products</h2>; // Index page for the /products section
}

// src/pages/ProductPage.tsx
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  RouteComponentProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';

// Route metadata used for documentation/manifests
export const handle = {
  route: {
    description: 'Product page',
    params: {
      id: 'Product id', // Dynamic :id segment in the path
    },
    search: {
      filter: 'Product type to filter by', // ?filter=... query parameter
    },
  },
} satisfies RouterHandle;

export async function clientLoader(
  { params, fusion }: LoaderFunctionArgs<{ id: string | undefined }>,
) {
  // Use Fusion HTTP module – no need to wire clients manually
  const client = fusion.modules.http.createHttpClient('products');
  // Use route params and custom context when calling the API
  return client.json(`/products/${params.id}?filter=${params.filter ?? ''}`);
}

export async function action({ request, fusion }: ActionFunctionArgs) {
  const formData = await request.formData();
  const input = formData.get('productId') as string | null;

  if (!input) {
    return { error: 'Product ID is required' };
  }

  // Use Fusion navigation module to move to the product page
  fusion.modules.navigation.navigate({ pathname: `/products/${input}` });
}

export default function ProductPage({
  loaderData,
  actionData,
}: RouteComponentProps<{ name: string; description: string }, { error?: string }>) {
  return (
    <div>
      <form method="post">
        {/* The action reads this value using `request.formData()` */}
        <input name="productId" type="text" />
        <button type="submit">View item</button>
      </form>

      {/* Validation error from the action (if any) */}
      {actionData?.error ? (
        <div>{actionData.error}</div>
      // Data returned from the loader
      ) : loaderData ? (
        <div>
          <h3>{loaderData.name}</h3>
          <p>{loaderData.description}</p>
        </div>
      ) : null}
    </div>
  );
}
```

In this example:

- `handle` documents the route for tools and manifests – it does not affect runtime behaviour.
- `clientLoader` runs **before** the component associated with the current route renders.
- `action` handles form submissions and can redirect or return validation errors.
- The component receives the loader and action results as `loaderData` and `actionData`, plus the `fusion` context if you need it.

### 2. Build the route tree with the DSL

Instead of building nested `RouteObject` trees by hand, you compose a **small array of route nodes**. Each helper (`layout`, `index`, `route`, `prefix`) returns a node; you can nest them as needed, and the router turns them into a React Router configuration for you.

```ts
// src/pages/index.ts
import { index, route, prefix, layout } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout('./MainLayout.tsx', [
  // Root index: '/'
  index('./HomePage.tsx'),

  // Group everything under '/products'
  prefix('products', [
    // '/products'
    index('./ProductsPage.tsx'),
    // '/products/:id'
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

### 3. Mount the Fusion Router

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { routes } from './routes';

export default function AppRouter() {
  // The Router creates a React Router instance wired to Fusion navigation
  return <Router routes={routes} />;
}
```

> [!IMPORTANT]
> Route components receive **reserved props**: `loaderData`, `actionData`, and `fusion`.  
> Avoid declaring props with those names yourself – use `RouteComponentProps` types instead.

---

## Best practices

- **Use one `Router` per app**  
  Keep `@equinor/fusion-framework-react-router` as the *only* place that wires React Router to Fusion. Do not create your own `RouterProvider` instances in parallel.

- **Keep page modules co‑located with route definitions**  
  Put route components, loaders, actions, and `handle` definitions in the same `src/pages/*.tsx` files. Keep the DSL tree in a small `src/pages/index.ts` module.

- **Use `fusion.context` for shared services**  
  Put long‑lived services (e.g. `QueryClient`, HTTP API wrapper, `Api` class) on `fusion.context` so they are available in loaders, actions, and components without extra React contexts. See [TypeScript: typing `fusion.context` and `handle`](#typescript-typing-fusioncontext-and-handle) for how to type your custom context.

- **Use `handle.route` consistently**  
  Always describe routes via `handle.route` – even for simple pages – so manifests and docs can rely on a complete route schema.

- **Avoid reserved props on components**  
  Do not declare your own props named `loaderData`, `actionData`, or `fusion`. Use `RouteComponentProps` for typing instead:

  ```tsx
  import type { RouteComponentProps } from '@equinor/fusion-framework-react-router';

  export default function MyPage({
    loaderData,
    actionData,
    fusion,
  }: RouteComponentProps<MyLoaderData, MyActionData>) {
    // ...
  }
  ```

- **Prefer the DSL for new apps**  
  The route DSL (`layout`, `index`, `route`, `prefix`) is the recommended approach for Fusion apps. It keeps routes co‑located with their components, generates manifest‑ready schemas automatically, and works seamlessly with the Vite plugin. If you have an existing React Router data route tree (`RouteObject[]`), you can pass it directly to `Router` while you migrate incrementally, but new projects should start with the DSL from day one.

---

## How it works

At runtime, Fusion React Router does three main things:

1. **Turns the DSL into React Router routes.**
2. **Connects React Router to the Fusion navigation module.**
3. **Injects a typed `fusion` object and reserved props into your route modules.**

### 1. Route DSL → React Router

All helpers are exported from `@equinor/fusion-framework-react-router/routes`:

```ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';
```

- Each call returns a `RouteNode` (`layout`, `index`, `route`, or `prefix`).
- The router (or Vite plugin) turns these nodes into React Router `RouteObject`s.
- File paths in the DSL point to page modules that export `default`, `clientLoader`, `action`, `ErrorElement`, and `handle` as needed.

The Vite plugin (`@equinor/fusion-framework-react-router/vite-plugin`) can **statically analyze** your DSL usage and emit optimized `RouteObject` code, while keeping the ergonomics of `layout/index/route/prefix` in your source.

> [!WARNING]
> **DSL + Vite plugin are experimental**  
> The route DSL (`layout`, `index`, `route`, `prefix`) and its Vite transform are still evolving. We are actively ironing out quirks in the transformation, especially around chunking and how large route trees are split into bundles. If you want the most stable path today, prefer building **plain React Router data routes** (`RouteObject[]` with loaders/actions) and pass them directly to `Router`; when you do opt into the DSL, remember that the plugin always lowers it back down to a standard `RouteObject` data‑route tree under the hood.

### 2. Router + Fusion navigation

The `Router` component is the **integration point** between React Router and Fusion Framework. You give it your route tree and, optionally, a loading element and a context object – it does the rest.

- **`routes`**: A single `RouteNode` or array built with `layout`, `index`, `route`, `prefix`, or plain `RouteObject`s.
- **`loader`**: Optional React element shown while lazy routes are loading.
- **`context`**: Custom object exposed as `fusion.context` in loaders, actions, and components.

Under the hood, the router:

- Reads `navigation.history` and `navigation.basename` from the Fusion navigation module.
- Creates a React Router instance using those values.
- Wraps loaders, actions, components, and error elements to inject the `fusion` object and reserved props.

### 3. `fusion` in loaders, actions, components, and errors

Every route module can export:

- `clientLoader(args: LoaderFunctionArgs)` – runs before the component associated with the current route renders.
- `action(args: ActionFunctionArgs)` – handles form submissions and mutations.
- `ErrorElement(props: ErrorElementProps)` – route‑scoped error boundary.
- `default(props: RouteComponentProps)` – the route component.

For all of them, Fusion React Router ensures:

- `args.fusion` contains **Fusion modules** (`fusion.modules`) and your **custom context** (`fusion.context`).
- Route components receive `loaderData`, `actionData`, and `fusion` as props.
- Error elements receive `error` and `fusion` as props.

> [!TIP]
> Your route modules stay close to React Router’s data APIs, but they never have to manually look up Fusion modules or contexts – the `fusion` object is injected for you.

### 4. `handle` and route schema

Each route can export a `handle` object conforming to `RouterHandle`:

- `handle.route` is the **canonical place** to describe the route (description, params, search).
- You can extend `RouterHandle` via module augmentation to attach extra metadata (permissions, navigation config, etc.).

These handles can be turned into a simple array schema using `toRouteSchema`:

```ts
import { toRouteSchema } from '@equinor/fusion-framework-react-router/schema';
import { pages } from './pages';

const routes = pages; // or layout(...), prefix(...), etc.

// Produce a flat, tool‑friendly representation of all routes
const schema = await toRouteSchema(routes);
// schema: RouteSchemaEntry[] = [ [path, description, { params?, search? }], ... ]
```

This schema can then be used in app manifests, portal integrations, or external documentation tooling.

---

## TypeScript: typing `fusion.context` and `handle`

The router’s `fusion` object and `handle` metadata are fully type‑safe and can be **extended via module augmentation**.

### Typing `fusion.context`

```ts
// router-context.d.ts
import type { QueryClient } from '@tanstack/react-query';
import type { Api } from './api';

declare module '@equinor/fusion-framework-react-router' {
  interface RouterContext {
    api: Api;
    queryClient: QueryClient;
  }
}
```

With this in place, `fusion.context.api` and `fusion.context.queryClient` are strongly typed in loaders, actions, and components.

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { QueryClient } from '@tanstack/react-query';

import { Api } from './api';
import { routes } from './routes';

export default function AppRouter() {
  const queryClient = new QueryClient();
  const api = new Api(queryClient);

  return <Router routes={routes} context={{ api, queryClient }} />;
}
```

```ts
// src/pages/SomePage.tsx
import type { LoaderFunctionArgs } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ fusion }: LoaderFunctionArgs) {
  // Typed access to your custom context
  const { api, queryClient } = fusion.context;

  return queryClient.fetchQuery({
    queryKey: ['current-user'],
    queryFn: () => api.getCurrentUser(),
  });
}
```

### Typing `handle` metadata

```ts
// router-handle.d.ts
declare module '@equinor/fusion-framework-react-router' {
  interface RouterHandle {
    permissions?: string[];
  }
}
```

`RouterHandle` is the type of the `handle` export used by the router – it always includes a `route` schema (used by `toRouteSchema`) and can be extended with your own fields. You can annotate handles as `const handle: RouterHandle = { ... }` or, as in the quick‑start example, write `const handle = { ... } satisfies RouterHandle` to keep type‑checking strict while still allowing extra metadata.

---

## Using `handle` for navigation (EDS sidebar example)

Because `handle` is part of the route metadata, you can use it to **drive your navigation UI** instead of hard‑coding menu items.

In your page modules, extend `RouterHandle` with a `navigation` field and populate it per route:

```ts
// router-handle-navigation.d.ts
import type { SidebarLinkProps } from '@equinor/eds-core-react';

declare module '@equinor/fusion-framework-react-router' {
  interface RouterHandle {
    navigation?: {
      label: string;
      icon?: SidebarLinkProps['icon'];
      /** Optional override for the link path (defaults to the route path) */
      path?: string;
    };
  }
}
```

```tsx
// src/pages/UsersPage.tsx
import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import { People } from '@equinor/eds-icons';

export const handle = {
  route: {
    description: 'Users overview',
  },
  navigation: {
    label: 'Users',
    icon: People,
    // path is optional – when omitted, the route path is used
  },
} satisfies RouterHandle;
```

You can then build an EDS sidebar from the route tree by reading `handle.navigation` for each page; the `cookbooks/app-react-router` example does this with a `useNavigationItems(pages)` hook and a `Navigation` component using `SideBar.Link`.

---

## Page modules: loaders, actions, components

A page module can export:

- `default` – the route component.
- `clientLoader` – client-side loader for data fetching.
- `action` – handles form submissions and mutations.
- `ErrorElement` – error boundary for this route.
- `handle` – route metadata (`RouterHandle` or `RouterSchema`).

```tsx
// src/pages/UserPage.tsx
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  RouteComponentProps,
  ErrorElementProps,
  RouterHandle,
} from '@equinor/fusion-framework-react-router';

// Route metadata – central place to describe params/search and human‑readable description
export const handle: RouterHandle = {
  route: {
    description: 'User detail page',
    params: { id: 'User id' }, // Matches ':id' in the path
  },
};

export async function clientLoader({ params, fusion }: LoaderFunctionArgs) {
  // Use Fusion HTTP module – the concrete base URL is configured in the app
  const client = fusion.modules.http.createHttpClient('users');
  // Use route param to build the URL
  return client.json(`/users/${params.id}`);
}

export async function action({ request, fusion }: ActionFunctionArgs) {
  const formData = await request.formData();
  const displayName = formData.get('displayName') as string | null;

  if (!displayName) {
    return { error: 'Display name is required' };
  }

  // Update current user using Fusion HTTP module and context
  const client = fusion.modules.http.createHttpClient('users');
  await client.post(`/users/${fusion.context.currentUserId}/display-name`, { displayName });
}

export default function UserPage({ loaderData, actionData }: RouteComponentProps<any, { error?: string }>) {
  return (
    <div>
      {/* Data from the loader – guaranteed to be available when the component renders */}
      <h1>{loaderData.name}</h1>
      {/* Validation error from the action, if any */}
      {actionData?.error && <p>{actionData.error}</p>}
      {/* ... */}
    </div>
  );
}

export function ErrorElement({ error }: ErrorElementProps) {
  // Error boundary for this route – shows any thrown errors from loader/action/component
  return <div>Something went wrong: {String(error)}</div>;
}
```

> [!NOTE]
> - `loaderData` – return value from `clientLoader`.  
> - `actionData` – return value from `action`.  
> - `fusion` – Fusion router context with `modules` and `context`.  
> These are injected for you; do not try to provide them manually.

This pattern is intentionally close to React Router’s own data APIs, but adds:

- A strongly‑typed `fusion` object, so you do not have to manually thread modules and services everywhere.
- A consistent `handle` schema that you can reuse for documentation and app manifests.

---

## Route schema and app manifests

Route handles can be turned into a simple schema array using `toRouteSchema`. This is useful when you need to provide route metadata to app manifests or external systems.

```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli/app';
import { toRouteSchema } from '@equinor/fusion-framework-react-router/schema';
import { routes } from './routes';

export const manifest = defineAppManifest(async () => ({
  appKey: 'my-app',
  routes: await toRouteSchema(routes),
}));
```

When the Fusion app manifest tooling/CLI reads this manifest, it will serialize it to JSON similar to:

```json
{
  "appKey": "my-app",
  "routes": [
    ["home", "Home page of application"],
    ["products", "Product list page"],
    [
      "product/:id",
      "Details of a product",
      {
        "params": {
          "id": "Identifier of the product"
        },
        "search": {
          "sort": "asc (default), desc for descending",
          "filter.type": "Product type to filter by"
        }
      }
    ]
  ]
}
```

In most applications you do not have to touch `toRouteSchema` directly – it becomes relevant when you integrate routing with **external tooling** (CLI, portals, documentation). The important takeaway is that if you keep your `handle.route` descriptions and param/search docs up‑to‑date, you get a reusable machine‑readable schema “for free”.

---

### Resolving URLs before loading the app

Because the schema is just data, a host (portal, widget shell, chatbot, etc.) can inspect it to resolve **URL slugs and search parameters** *before* mounting your app.

For example, a chatbot could look up a “user details” route and construct a deep link with validated search parameters:

```ts
// Pseudo-code in a host system (e.g. chatbot widget)
import { toRouteSchema } from '@equinor/fusion-framework-react-router/schema';
import { routes } from './routes';

const schema = await toRouteSchema(routes);

// Find the route we want to deep-link to
const userDetails = schema.find(([path, description]) =>
  description === 'User detail page',
);

if (userDetails) {
  const [path, , meta] = userDetails;

  // meta.search now documents available search params (e.g. userId)
  const url = `${baseUrl}/${path}?userId=${encodeURIComponent(userId)}`;

  // Use this URL in a widget, chatbot response, or portal link
}
```

This makes the DSL and `handle.route` not just a router configuration, but a **contract** for external systems that need to reason about your app’s URLs without running its code.

---

## Using the Vite plugin without Fusion Framework CLI

You can use the DSL + Vite transform even in apps that **do not use the Fusion Framework CLI**. The Vite plugin scans for `layout/index/route/prefix` imports and rewrites them into standard React Router `RouteObject` data routes.

### 1. Enable the plugin in `vite.config.ts`

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactRouterPlugin } from '@equinor/fusion-framework-react-router/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    reactRouterPlugin({
      // Optional: turn on debug logging while you integrate
      debug: true,
    }),
  ],
});
```

### 2. Use the DSL in any module

With the plugin enabled, you can use the DSL anywhere in your app – the plugin will:

- Find imports of `layout`, `index`, `route`, `prefix` from `@equinor/fusion-framework-react-router/routes`.
- Inspect the referenced files to see which exports exist (`default`, `clientLoader`, `action`, `handle`, `ErrorElement`).
- Generate the corresponding **data route objects** with `Component`, `loader`, `action`, `handle`, `errorElement`, and injected `fusion` context.

```ts
// src/pages/index.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout('./Root.tsx', [
  index('./HomePage.tsx'),
  prefix('products', [
    index('./ProductsPage.tsx'),
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

At build time, the plugin rewrites this to a plain `RouteObject[]` tree. At runtime, `Router` only ever sees **standard data routes**; the DSL is a source‑level convenience.

> [!NOTE]
> The plugin is intentionally conservative: it only transforms files that both import the DSL helpers and actually call them. If you remove the DSL from a file, the plugin becomes a no‑op for that file.

---

## Migration from plain React Router

If you currently have a React Router route tree like this:

```tsx
// routes.ts
import Root from './pages/Root';
import Home from './pages/HomePage';
import Products from './pages/ProductsPage';
import Product from './pages/ProductPage';

export const routes = [
  {
    // Layout/root route
    element: <Root />,
    path: '/',
    errorElement: <RouterError />,
    handle: {
      route: {
        description: 'Root layout',
      },
    },
    children: [
      {
        // '/'
        index: true,
        element: <Home />,
        handle: {
          route: {
            description: 'Home page of application',
          },
        },
      },
      {
        // '/products'
        path: 'products',
        element: <Products />,
        handle: {
          route: {
            description: 'Product list page',
          },
        },
        children: [
          {
            // '/products/:id'
            path: ':id',
            element: <Product />,
            handle: {
              route: {
                description: 'Details of a product',
                params: {
                  id: 'Identifier of the product',
                },
              },
            },
          },
        ],
      },
    ],
  },
];
```

You can migrate to Fusion React Router by:

1. Moving route components into page modules.
2. Exporting `clientLoader`, `action`, and `handle` from those modules as needed.
3. Replacing the route object tree with the DSL:

```ts
// src/pages/index.ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout('./Root.tsx', [
  // '/'
  index('./HomePage.tsx'),
  // '/products/...'
  prefix('products', [
    // '/products'
    index('./ProductsPage.tsx'),
    // '/products/:id'
    route(':id', './ProductPage.tsx'),
  ]),
]);
```

4. Mounting the `Router` component:

```tsx
// App.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { pages } from './pages';

export default function App() {
  return <Router routes={pages} />;
}
```

From here you can start using Fusion modules in loaders and actions, and generate route schemas with `toRouteSchema`. For more advanced patterns (debug toolbar, React Query integration, richer APIs), see `cookbooks/app-react-router`.

---

## Common pitfalls & troubleshooting

- **`fusion.modules.navigation` is `undefined` or navigation does not work**
  - Make sure your Fusion app is configured with `@equinor/fusion-framework-module-navigation`.
  - Do not create your own `RouterProvider`; always use `@equinor/fusion-framework-react-router`’s `Router` component.

- **Loaders/actions do not receive `fusion`**
  - Verify that `clientLoader` and `action` are exported from the **page module** that your DSL points to.
  - Ensure imports come from `@equinor/fusion-framework-react-router` and not from React Router types directly.

- **Components complain about unknown props (`fusion`, `loaderData`, `actionData`)**
  - Route components automatically receive these props; type them using `RouteComponentProps` instead of declaring your own prop types.
  - Do not forward these props to child components unless you intend to.

- **`handle.route.params` / `search` do not match actual routes**
  - Keep `handle.route.params` in sync with your route paths (e.g. `path: 'users/:id'` ↔ `params: { id: 'User id' }`).
  - Make sure query parameters in `search` (e.g. `filter`, `sort`) match how your loaders/actions read them.

- **Schemas or manifests look wrong**
  - Check that every route you care about has a `handle.route` description.
  - Confirm you are passing the same route tree to both `Router` and `toRouteSchema`.

- **Vite plugin does not pick up routes**
  - Ensure you import the DSL helpers from `@equinor/fusion-framework-react-router/routes`.
  - Use relative paths like `'./MyPage.tsx'` in DSL calls; the plugin resolves these and wires up the correct imports.

If you run into an issue that is not covered here, look at the `cookbooks/app-react-router` example, which shows the router integrated in a full Fusion app including navigation, manifests, and a sidebar driven by `handle` metadata.

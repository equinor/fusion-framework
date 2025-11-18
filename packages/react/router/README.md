## Fusion React Router

Fusion React Router (`@equinor/fusion-framework-react-router`) is a thin layer on top of **React Router v7** that:

- **Integrates with Fusion Framework** – navigation, modules, and app context are wired in for you.
- **Uses a small DSL** (`layout`, `index`, `route`, `prefix`) to define routes in a file-based style.
- **Injects Fusion context** into loaders, actions, and components via a `fusion` object.
- **Supports lazy loading** and **route schemas** for documentation and manifests.

Use this package when you build Fusion apps that should:

- Use the Fusion navigation module and history.
- Share services (e.g. `QueryClient`, APIs) across routes via a single router context.
- Describe routes with schemas that can be reused in manifests or docs.

For a complete, end‑to‑end example, see the `cookbooks/app-react-router` cookbook.

---

## Installation & prerequisites

Fusion React Router is designed to run **inside a Fusion app** that already uses Fusion modules.

- **Runtime requirements**
  - React 18+ and React DOM 18+
  - React Router v7 (`react-router` / `react-router-dom`)
- **Fusion dependencies**
  - `@equinor/fusion-framework-react-module`
  - `@equinor/fusion-framework-module-navigation`

In most Fusion app templates these are already configured. If you add the router yourself, install it alongside React Router:

```bash
pnpm add @equinor/fusion-framework-react-router react-router-dom
```

> The router reads `history` and `basename` from the Fusion navigation module, so make sure your app configuration includes `@equinor/fusion-framework-module-navigation`.

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
- `clientLoader` runs **before** the component renders and can use Fusion modules and `fusion.context`.
- `action` handles form submissions and can redirect or return validation errors.
- The component receives the loader and action results as `loaderData` and `actionData`, plus the `fusion` context if you need it.

### 2. Build the route tree with the DSL

Instead of building nested `RouteObject` trees by hand, you compose a **small array of route nodes**. Each helper (`layout`, `index`, `route`, `prefix`) returns a node; you can nest them as needed, and the router turns them into a React Router configuration for you.

```ts
// src/pages/index.ts
import { index, route, prefix, layout } from '@equinor/fusion-framework-react-router/routes';

export const pages = layout(import.meta.resolve('./MainLayout.tsx'), [
  // Root index: '/'
  index(import.meta.resolve('./HomePage.tsx')),

  // Group everything under '/products'
  prefix('products', [
    // '/products'
    index(import.meta.resolve('./ProductsPage.tsx')),
    // '/products/:id'
    route(':id', import.meta.resolve('./ProductPage.tsx')),
  ]),
]);
```

### 3. Mount the Fusion Router

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { pages } from './pages';

export default function AppRouter() {
  // The Router creates a React Router instance wired to Fusion navigation
  return <Router routes={pages} />;
}
```

> **Note**  
> Route components receive **reserved props**: `loaderData`, `actionData`, and `fusion`.  
> Avoid declaring props with those names yourself – use `RouteComponentProps` types instead.

---

## Router component
The `Router` component is the **integration point** between React Router and Fusion Framework. You give it your route tree and, optionally, a loading element and a context object – it does the rest.

- **`routes`**: A single `RouteNode` or array built with `layout`, `index`, `route`, `prefix`.
- **`loader`**: Optional React element shown while lazy routes are loading.
- **`context`**: Custom object exposed as `fusion.context` in loaders, actions, and components.

The router uses the Fusion navigation module under the hood:

- It reads `navigation.history` and `navigation.basename`.
- It injects Fusion modules and `context` into all route loaders (`clientLoader`), actions, and components.

### Sharing app services via `context`

The `context` prop is the simplest way to share **application‑level services** (API wrappers, `QueryClient`, configuration) with all your pages. Anything you put there will be available as `fusion.context` inside loaders, actions, and components without extra React context plumbing.

```tsx
// src/Router.tsx
import { Router } from '@equinor/fusion-framework-react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { pages } from './pages';

export default function AppRouter() {
  // Single QueryClient instance for the whole app
  const queryClient = new QueryClient();

  return (
    // Provide QueryClient via React context
    <QueryClientProvider client={queryClient}>
      {/* Make QueryClient available to all loaders via fusion.context */}
      <Router routes={pages} context={{ queryClient }} />
    </QueryClientProvider>
  );
}
```

```tsx
// src/pages/SomePage.tsx
import type { LoaderFunctionArgs } from '@equinor/fusion-framework-react-router';

export async function clientLoader({ fusion }: LoaderFunctionArgs) {
  // HTTP client from Fusion HTTP module
  const httpClient = fusion.modules.http.createHttpClient('api');
  // Shared QueryClient from Router context
  const { queryClient } = fusion.context;

  return queryClient.fetchQuery({
    queryKey: ['stuff'],
    queryFn: () => httpClient.json('/my-api/endpoint'),
  });
}
```

If you prefer a richer API surface, you can create your own `Api` class that holds `queryClient` and HTTP clients and pass it in `context`. This pattern is demonstrated in `cookbooks/app-react-router`.

---

## TypeScript: typing `fusion.context` and `handle`

The router’s `fusion` object and `handle` metadata are fully type‑safe and can be **extended via module augmentation**.

- **Typing `fusion.context`**

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

- **Typing `handle` metadata**

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

## Route DSL

All helpers are exported from `@equinor/fusion-framework-react-router/routes`:

```ts
import { layout, index, route, prefix } from '@equinor/fusion-framework-react-router/routes';
```

### `index(file, schema?)`

Creates an **index route** – the default route for a segment (typically your `/` or `/section` landing page).

```ts
index(import.meta.resolve('./HomePage.tsx'))
// → '/'
```

### `route(path, file, children?, schema?)`

Creates a **standard route** with a path. The path can include dynamic segments like `:id` or `:id?` and can have nested child routes.

```ts
route(':id', import.meta.resolve('./ProductPage.tsx'))
// when nested under prefix('products') → '/products/:id'
```

### `prefix(path, children)`

Creates a **virtual group** of routes under a common path prefix, without introducing a layout component. This is useful when you want clean URLs and grouping, but do not need shared UI.

```ts
prefix('products', [
  index(import.meta.resolve('./ProductsPage.tsx')),       // '/products'
  route(':id', import.meta.resolve('./ProductPage.tsx')), // '/products/:id'
]);
```

### `layout(file, children)`

Wraps a set of routes in a **layout component** that renders an `<Outlet />`. Use this when you want shared UI (navigation, header, shell) around a group of routes.

```ts
layout(import.meta.resolve('./MainLayout.tsx'), [
  index(import.meta.resolve('./HomePage.tsx')), // '/'
  prefix('products', [/* product routes */]),   // '/products/...'
]);
```

Internally, these helpers create `RouteNode`s which are converted to React Router `RouteObject`s using `createRoutes`. You normally do not call `createRoutes` yourself – `Router` handles it – which keeps your route definitions close to the file structure you already have.

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
- `HydrateFallback` – element used during SSR hydration.
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

> **Reserved values**  
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
import { toRouteSchema } from '@equinor/fusion-framework-react-router';
import { pages } from './pages';

const routes = pages; // or layout(...), prefix(...), etc.

// Produce a flat, tool‑friendly representation of all routes
const schema = await toRouteSchema(routes);
// schema: RouteSchemaEntry[] = [ [path, description, { params?, search? }], ... ]
```

Example of how this schema can be used in an app manifest:

```ts
import { defineAppManifest } from '@equinor/fusion-framework-cli/app';
import { routes } from './routes';

export const manifest = defineAppManifest(() => ({
  appKey: 'my-app',
  routes,
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

## Migration from plain React Router

If you currently have a React Router route tree like this:

```tsx
// routes.ts
export const routes = [
  {
    // Layout/root route
    element: <Root />,
    path: '/',
    errorElement: <RouterError />,
    children: [
      // '/'
      { index: true, element: <Home /> },
      {
        // '/products'
        path: 'products',
        element: <Products />,
        // '/products/:id'
        children: [{ path: ':id', element: <Product /> }],
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

export const pages = layout(import.meta.resolve('./Root.tsx'), [
  // '/'
  index(import.meta.resolve('./HomePage.tsx')),
  // '/products/...'
  prefix('products', [
    // '/products'
    index(import.meta.resolve('./ProductsPage.tsx')),
    // '/products/:id'
    route(':id', import.meta.resolve('./ProductPage.tsx')),
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

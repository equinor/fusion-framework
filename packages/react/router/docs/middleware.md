# Route middleware

Route middleware runs before a route's loaders and actions. Use it for guards, redirects, timing, and for passing per-request values to handlers. The Fusion `Router` uses the React Router v8 client Data Mode middleware pipeline. Fusion adds the arguments it needs and leaves ordering, `next()` handling, redirects, error boundaries and cancellation to React Router.

> This is Data Mode `middleware`. It is not Framework Mode `clientMiddleware`, and it does not wrap rendering. A component that checks access during render is not middleware.

## Declaring middleware

Export `middleware` from a route module. The DSL signatures do not change. The Vite plugin (`@equinor/fusion-framework-vite-plugin-react-router`) picks up the export next to `clientLoader`, `action`, `handle`, `ErrorElement` and the other route exports.

```tsx
// pages/ReportsPage.tsx
import { redirect, type MiddlewareFunction } from '@equinor/fusion-framework-react-router';

// `isSignedIn` is an app-defined value passed through `<Router context={...}>`
// (declare it by augmenting the `RouterContext` interface).
const requireSignIn: MiddlewareFunction = async ({ fusion }, next) => {
  if (!fusion.context.isSignedIn) {
    throw redirect('/sign-in');
  }
  return next();
};

export const middleware = [requireSignIn];

export default function ReportsPage() {
  return <h1>Reports</h1>;
}
```

```ts
// routes.ts
import { layout, route } from '@equinor/fusion-framework-react-router/routes';

export const routes = layout('./Layout.tsx', [route('reports', './pages/ReportsPage.tsx')]);
```

Plain route objects use the same property:

```ts
import type { RouteObject } from '@equinor/fusion-framework-react-router';

const routes: RouteObject[] = [{ path: '/reports', middleware: [requireSignIn], Component: ReportsPage }];
```

Routes that the DSL produces and routes declared as plain objects take the same runtime path. The router does not inspect, serialize or derive policy from middleware functions.

## Arguments

`MiddlewareFunction<TParams, TContext, TResult>` receives:

| Argument  | Description                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| `request` | The navigation, fetcher or submission `Request`.                                           |
| `url`     | The request URL.                                                                           |
| `pattern` | The matched route pattern, for example `/projects/:projectId`.                             |
| `params`  | Matched URL parameters, typed by `TParams`.                                                |
| `context` | The per-execution `RouteContextProvider`, shared with loaders and actions. |
| `signal`  | Abort signal for the execution, the same object as `request.signal`.                       |
| `fusion`  | `{ modules, context }`, the Fusion modules and the `context` prop passed to `<Router>`.    |

The second argument, `next`, runs the rest of the chain and the route handlers. It resolves to their result. Calling `next()` is optional: if a middleware returns without calling it, React Router continues the chain. Calling `next()` twice throws.

## Execution order

- Middleware runs from the outermost matched route to the innermost. Within a route it runs in array order.
- Code after `await next()` runs in reverse order.
- The whole matched chain runs before any loader or action on the route. This includes component-only routes with no loaders.
- The chain runs for navigations, fetcher loads, fetcher submissions, actions and revalidations. Each run gets a new `context` and a new request.
- On a navigation between children of a mounted layout, the layout middleware runs again even when the layout loader does not revalidate.

## Rejecting, redirecting and errors

- Throw an error before `next()` to stop the chain. No downstream loader or action runs, and the error goes to the nearest error boundary (`ErrorElement`/`errorElement`).
- Throw or return `redirect(...)` to redirect.
- An error thrown after `next()` goes to the error boundary of the route that declared the middleware, or to the nearest one above it.
- When the execution is cancelled, for example by a newer navigation, `signal` is aborted and React Router discards the result. Pass `signal` on to async work so it stops early.

## Passing values to loaders and actions

Middleware, loaders and actions of one execution share a single `context`. Its type is `RouteContextProvider`, which is React Router v8's `Readonly<RouterContextProvider>`. Create a typed key with `createContext<T>()`, write it with `context.set(key, value)` in middleware, and read it with `context.get(key)` in a loader or action. `get` returns `T` and `set` only accepts a `T`, so no casts are needed. Every navigation, fetcher call, action and revalidation gets a new provider, so values never leak between executions.

```ts
// viewer-context.ts: share the key between modules
import { createContext } from '@equinor/fusion-framework-react-router';

export type Viewer = { name: string; canWrite: boolean };

// No default value: `get` throws if middleware did not set it, instead of silently guessing.
export const viewerContext = createContext<Viewer>();
```

```tsx
// pages/ProjectPage.tsx
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MiddlewareFunction,
  RouteComponentProps,
} from '@equinor/fusion-framework-react-router';
import { viewerContext } from '../viewer-context';

type Params = { projectId?: string };

const resolveViewer: MiddlewareFunction<Params> = async ({ context, fusion, signal }, next) => {
  // `loadViewer` is app code, for example a call through an HTTP client from `fusion.modules`.
  const viewer = await loadViewer(fusion, signal);
  context.set(viewerContext, viewer);
  return next();
};

export const middleware = [resolveViewer];

export async function clientLoader({ context, params }: LoaderFunctionArgs<Params>) {
  const viewer = context.get(viewerContext); // Viewer
  return { project: params.projectId, viewer: viewer.name };
}

export async function action({ context, request }: ActionFunctionArgs<Params>) {
  const viewer = context.get(viewerContext); // Viewer
  if (!viewer.canWrite) {
    throw new Error(`${viewer.name} may not write`);
  }
  const form = await request.formData();
  return { saved: form.get('value') };
}

export default function ProjectPage({ loaderData }: RouteComponentProps<{ viewer: string }>) {
  return <p>{loaderData.viewer}</p>;
}
```

The same functions work on plain route objects: `{ path: '/projects/:projectId', middleware, loader: clientLoader, action }`.

### Handler argument compatibility

`LoaderFunctionArgs`, `ActionFunctionArgs` and `MiddlewareFunctionArgs` all carry React Router's `request`, `url`, `pattern`, `params` and `context`, plus Fusion's `fusion`. Middleware also gets `signal`. The generic parameters `<TParams, TContext>` are unchanged.

- Existing Fusion loaders and actions keep compiling. They receive extra properties, which they can ignore.
- `RouteObject.loader` and `RouteObject.action` are typed with Fusion's `LoaderFunction` and `ActionFunction`. Loaders typed with React Router's own `LoaderFunction`/`ActionFunction` remain assignable.
- Code that builds handler arguments by hand, for example a unit test that calls a loader directly, must now pass `url`, `pattern` and `context`. A `new RouterContextProvider()` works for `context`.

## Lazy routes

Middleware can be loaded lazily with the object form of `lazy`. React Router loads lazy middleware for all matched routes before the chain runs, so a guard always runs before a lazy loader. Lazy `Component` chunks of routes that are not matched stay unloaded.

```ts
const route: RouteObject = {
  path: '/admin',
  lazy: {
    middleware: () => import('./admin-guard').then((m) => m.middleware),
    loader: () => import('./admin-loader').then((m) => m.loader),
    Component: () => import('./AdminPage').then((m) => m.default),
  },
};
```

The function form of `lazy` cannot return `middleware`; that is a React Router limitation.

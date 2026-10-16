---
"@equinor/fusion-framework-react-router": minor
---

Add route middleware on the React Router v8 client Data Mode pipeline.

- Route objects and route modules can declare `middleware: MiddlewareFunction[]`. `Router` passes each middleware `request`, `url`, `pattern`, typed `params`, the per-execution `context`, `signal` (the request abort signal) and `fusion` (Fusion modules and the `<Router context>` value).
- React Router owns the order (parent before child, declaration order, reverse after `await next()`), redirects, error boundaries and cancellation. The whole matched chain runs before loaders and actions, including for component-only routes, fetchers and revalidations.
- `lazy` accepts `middleware` in its object form.
- Typed context flows from middleware to handlers. `LoaderFunctionArgs`, `ActionFunctionArgs` and `MiddlewareFunctionArgs` now declare `context: RouteContextProvider`, which is React Router v8's `Readonly<RouterContextProvider>`. They also declare upstream `url` and `pattern`. A value set with `context.set(createContext<T>(), value)` in middleware is read as `T` with `context.get(key)` in the loader or action of the same execution, without casts.
- `RouteObject.loader` and `RouteObject.action` are typed with Fusion's `LoaderFunction` and `ActionFunction`, so typed Fusion handlers no longer need casts on route objects. Loaders and actions typed with React Router's own types remain assignable. The generic `<TParams, TContext>` signatures are unchanged.
- Compatibility: existing loaders and actions keep compiling. Code that builds handler arguments by hand, such as unit tests calling a loader directly, must now also pass `url`, `pattern` and `context` (for example `new RouterContextProvider()`).
- New type exports: `MiddlewareFunction`, `MiddlewareFunctionArgs`, `MiddlewareNextFunction`, `RouteContextProvider` and `RouteObjectLazy`. `createContext` and `RouterContextProvider` are re-exported from `react-router` for passing typed values from middleware to loaders and actions.
- Fix: route wrappers are no longer applied twice when React Router re-maps a route after a lazy property loads. Before this, a route with a static `errorElement` and a lazy property failed to render its error boundary.

Guide: [`packages/react/router/docs/middleware.md`](https://github.com/equinor/fusion-framework/blob/main/packages/react/router/docs/middleware.md). Ref equinor/fusion-core-tasks#2352.

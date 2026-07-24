---
"@equinor/fusion-framework-react-router": minor
---

Fix `errorElement` typing and add `ErrorBoundary` support in `RouteObject`.

**`errorElement`**: The type was incorrectly inherited from React Router as `ReactNode`, but the Fusion router has always required a `ComponentType` so it can inject `error` and `fusion` context as props. Passing a rendered element (`<MyError />`) compiled but failed at runtime. The type now correctly reflects the implementation.

```tsx
// Before — compiled but crashed at runtime
const routes = [
  { path: '/', element: <Home />, errorElement: <MyError /> },
] satisfies RouteObject[];

// After — pass the component directly (no cast needed)
const routes = [
  { path: '/', element: <Home />, errorElement: MyError },
] satisfies RouteObject[];
```

**`ErrorBoundary`**: Previously silently ignored at runtime — the Fusion router replaced react-router's default `mapRouteProperties` entirely but never converted `ErrorBoundary` to `errorElement` or set `hasErrorBoundary`, so react-router never registered the boundary. Now works correctly: the component is wrapped to inject `error` and `fusion` as props and then converted to `errorElement` internally, matching react-router's own default behaviour.

```tsx
const routes = [
  { path: '/', element: <Home />, ErrorBoundary: MyError },
] satisfies RouteObject[];
```

**`ErrorElementProps` / `ErrorElement`**: The default `TError` type changed from `Error` to `unknown`, which is more accurate since React Router can throw any value (strings, response objects, etc.). Narrow the error type in your component if needed.

```tsx
// Explicit type param still works as before
function MyError({ error }: ErrorElementProps<Error>) {
  return <p>{error.message}</p>;
}
```

Fixes: https://github.com/equinor/fusion/issues/863
Thanks @AndreasPresthammer for the detailed repro.

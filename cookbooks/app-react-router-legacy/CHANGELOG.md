# @equinor/fusion-framework-cookbook-app-react-router-legacy

## 1.0.2

### Patch Changes

- 80c3e4a: Internal: split `ErrorElementPage.tsx` (clientLoader, ErrorElementPage, ErrorElementBoundary) into separate files under `src/components/`, resolving a `single-export-per-file` lint violation; no consumer-facing behavior change.
- 80c3e4a: Internal: resolve `fusion-lint` warnings across `App.tsx`, `ErrorElementPage.tsx`, `HomePage.tsx`, and `RootErrorBoundary.tsx`. No behavior change.

## 1.0.1

### Patch Changes

- bc05307: Add cookbook demonstrating `RouteObject[]` (legacy/manual) routing with `errorElement` and `ErrorBoundary`.

  Shows the plain array approach as an alternative to the DSL (`route()` / `layout()`), with working examples of both error handling patterns and inline comments explaining the differences from standard React Router.

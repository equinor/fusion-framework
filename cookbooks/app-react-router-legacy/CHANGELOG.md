# @equinor/fusion-framework-cookbook-app-react-router-legacy

## 1.0.4

### Patch Changes

- 79014cd: Internal: centralize direct React runtime and type dependencies in a shared workspace
  catalog. Pin React and React DOM to the same 19.3.1 runtime version to prevent
  incompatible resolutions. Consumer-facing peer dependency ranges are unchanged.

## 1.0.3

### Patch Changes

- f663b46: Internal: promote packages already published on the `next` prerelease channel to their stable versions.

## 1.0.2

### Patch Changes

- 80c3e4a: Internal: split `ErrorElementPage.tsx` (clientLoader, ErrorElementPage, ErrorElementBoundary) into separate files under `src/components/`, resolving a `single-export-per-file` lint violation; no consumer-facing behavior change.
- 80c3e4a: Internal: resolve `fusion-lint` warnings across `App.tsx`, `ErrorElementPage.tsx`, `HomePage.tsx`, and `RootErrorBoundary.tsx`. No behavior change.

## 1.0.1

### Patch Changes

- bc05307: Add cookbook demonstrating `RouteObject[]` (legacy/manual) routing with `errorElement` and `ErrorBoundary`.

  Shows the plain array approach as an alternative to the DSL (`route()` / `layout()`), with working examples of both error handling patterns and inline comments explaining the differences from standard React Router.

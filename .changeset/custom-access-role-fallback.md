---
"@equinor/fusion-framework-react-components-roles": minor
---

Allow a custom fallback for required-access-role failures in `AccessRoleBoundary` and `RolesProvider`.

Pass `fallbackRender` or `FallbackComponent` (both receive `{ error, resetErrorBoundary }`) to replace the built-in recovery UI. `fallbackRender` takes precedence when both are provided. Unrelated errors are still rethrown to the outer error boundary, and behavior is unchanged when neither prop is set. Adds the `AccessRoleBoundaryFallbackProps` type export.

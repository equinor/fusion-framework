---
"@equinor/fusion-framework-react-router": minor
---

Add `requireRoles` route middleware for Fusion Roles V2 access roles.

```ts
import { requireRoles } from '@equinor/fusion-framework-react-router';

export const middleware = [requireRoles(['Reports.Read'])];
// or: requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })
```

- The check runs through the Roles provider's `hasAccessRole` on every middleware execution: navigations, revalidations, fetchers and submissions. It runs before any protected loader, action or component.
- Default mode is `all`. Names are exact and case-sensitive, trimmed and deduplicated. Empty lists, blank names and unknown modes throw a `TypeError` when the route module loads.
- Requirements on parent and child routes combine with AND.
- Failures throw `RequireRolesError` with reason `denied`, `check-failed` (provider error, not a denial) or `not-configured` (Roles module missing). For `denied`, the provider's `RequiredAccessRolesError` is kept as `cause`.
- `getRouteMiddlewareMetadata` reports `{ kind: 'roles', mode, roles }` for role gates and `{ kind: 'custom' }` for other middleware.
- The new React-free `/middleware-metadata` entry point exports the normalization and static-recognition contract for build tools.

The package now depends on `@equinor/fusion-framework-module-roles`. Apps using `requireRoles` must enable the Roles module.

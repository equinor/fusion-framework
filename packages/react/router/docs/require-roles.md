# Role-gated middleware

Use the opt-in `requireRoles` helper from **React App's Roles integration** to protect routes.
The router runs ordinary [middleware](middleware.md); it has no Roles dependency
or role-specific guard APIs. Applications do not implement their own guard.

## Enable Roles in the application

Enable `@equinor/fusion-framework-module-roles` in your application's configuration
with `enableRoles(configurator)`. The helper is available from the existing
`@equinor/fusion-framework-react-app/roles` entry point.

## Gate a page or layout

```ts
import { requireRoles } from '@equinor/fusion-framework-react-app/roles';

export const middleware = [requireRoles(['Reports.Read'])];
```

Every listed role is required by default. To accept any one role:

```ts
import { requireRoles } from '@equinor/fusion-framework-react-app/roles';

export const middleware = [
  requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' }),
];
```

Put the middleware on a layout to protect its children. Every matched parent and
child gate must pass; a child cannot weaken a parent requirement. The helper
works with the same middleware lifecycle as any other guard, including loaders,
actions, revalidation, fetcher operations and component-only routes.

## Access checks and errors

- The existing Roles provider performs the check and owns caching.
- Role names are case-sensitive, trimmed and deduplicated. Blank names, an empty
  list or an invalid mode fail when the middleware is declared.
- Name-only checks use global role assignments, not resource-specific access.
- Missing access throws the provider's `RequiredAccessRolesError` unchanged.
  Use `RequiredAccessRolesError.is(error)` from
  `@equinor/fusion-framework-module-roles/errors` in your route error boundary to
  distinguish denial from configuration or service failures.
- Checks finish before downstream work runs. Cancelled operations cannot
  continue after a late access response.
- A missing Roles module is an explicit configuration error, never granted access.

## Activation, metadata and security

Role activation and retry are separate from this guard. The router does not
provide role-specific recovery or replay APIs, and this helper does not silently
retry submissions. Optional recovery must respect the lifetime of the original
operation.

The helper does not add a role-metadata API to the router. Static manifest
publication needs a separately defined extraction contract and must not execute
middleware or page modules.

Client role gates protect navigation and UI only. Backend endpoints must still
authorize every request.

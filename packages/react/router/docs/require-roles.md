# Role gates with application middleware

Use [route middleware](middleware.md) to check access before protected loaders,
actions and pages run. The router provides the middleware lifecycle, not a role
policy: it does not depend on `@equinor/fusion-framework-module-roles` or export
`requireRoles`.

An application that uses Fusion Roles V2 can own a small `requireRoles` helper.
Other applications can use a different authorization provider without changing
the router.

## Enable Roles in the application

Add `@equinor/fusion-framework-module-roles` to the **application's** dependencies
and call its `enableRoles(configurator)` during app configuration. The initialized
provider is then available as `fusion.modules.roles`.

The context type below extends the standard Fusion modules with this
application's Roles provider. Add other application-specific providers as needed.

## Create an app-owned helper

```ts
// src/middleware/require-roles.ts
import type { IRolesProvider } from '@equinor/fusion-framework-module-roles';
import type {
  FusionRouterContext,
  MiddlewareFunction,
} from '@equinor/fusion-framework-react-router';

interface AppContext extends FusionRouterContext {
  modules: FusionRouterContext['modules'] & { roles: IRolesProvider };
}
type AppMiddleware = MiddlewareFunction<Record<string, string | undefined>, AppContext>;

/**
 * Requires this application's access roles before running the rest of the route chain.
 * @param roles - Exact, case-sensitive Roles V2 access-role names.
 * @param options - Require all roles by default, or any one role with mode `any`.
 * @returns Application middleware; provider errors propagate to the route error boundary.
 * @throws {TypeError} When a requirement is empty, blank or has an unsupported mode.
 */
export function requireRoles(
  roles: readonly string[],
  { mode = 'all' }: { mode?: 'all' | 'any' } = {},
): AppMiddleware {
  const names = [...new Set(roles.map((role) => role.trim()))];
  if (names.length === 0 || names.some((name) => name.length === 0)) {
    throw new TypeError('A role gate requires nonblank access-role names.');
  }
  if (mode !== 'all' && mode !== 'any') {
    throw new TypeError('A role gate mode must be all or any.');
  }

  return async ({ fusion, signal }, next) => {
    signal.throwIfAborted();
    const provider = fusion.modules.roles;
    if (!provider) {
      throw new Error('Enable the Roles module before using this application role gate.');
    }

    const granted = await provider.hasAccessRole(names, {
      required: mode === 'all',
      assert: true,
    });
    // A check can finish after navigation or submission cancellation.
    signal.throwIfAborted();
    if (granted !== true) {
      throw new Error('The required access roles are not active.');
    }
    return next();
  };
}
```

The provider owns authorization and caching. `required: true` checks all listed
roles; `required: false` checks any one. With `assert: true`, missing access throws
the provider's `RequiredAccessRolesError`. Service failures remain service
failures: do not catch them and continue the chain.

Name-only checks use the provider's global assignments. They are not a
resource-specific authorization check.

## Gate a page or layout

Import the helper from your application, **not** from the router package:

```ts
// src/pages/ReportsPage.tsx
import { requireRoles } from '../middleware/require-roles.js';

export const middleware = [requireRoles(['Reports.Read'])];
```

```ts
// A different page: either access role is sufficient.
import { requireRoles } from '../middleware/require-roles.js';

export const middleware = [
  requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' }),
];
```

Put the gate on a layout to protect its children. Parent and child middleware
must both pass; a child cannot weaken a parent gate. Middleware also runs for
revalidation, fetcher loads, submissions and component-only routes. A thrown
error stops downstream work and reaches the nearest route error boundary.
Returning without calling `next()` is **not** a denial; throw to reject access.

## Handle denial separately from service failure

In your route's `ErrorElement`, use
`RequiredAccessRolesError.is(error)` from
`@equinor/fusion-framework-module-roles/errors` to distinguish denied access.
Its `missingAccessRoles` describes the missing roles. Render an access message or
your app's role-activation UI for that case; preserve an explicit error state for
network, configuration and other failures.

Role activation and retry belong to the application or an optional Roles
integration, not the router. After activation, recheck access and retry only a
still-relevant operation. Do not automatically replay a submission after its
owner has closed, or assume a fetcher result will reach a remounted owner.
The middleware runtime does not provide role-specific recovery or replay APIs.

## Routing metadata and security boundaries

This application helper is custom middleware. Build tools must not execute it,
infer access requirements from its function name, or treat published role
descriptions as authorization. Static manifest metadata needs its own explicit
contract; this example does not introduce automatic role extraction.

Client role gates protect navigation and UI only. Every backend endpoint must
still authorize its requests.

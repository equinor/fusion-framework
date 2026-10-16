# Requiring access roles

`requireRoles` is route middleware that checks Fusion Roles V2 access roles before a route's loaders, actions and components run. It builds on [route middleware](middleware.md).

When access is denied, the user can activate a claimable role from the route's error element and retry exactly the operation that was denied. See [Recovering access](#recovering-access).

## Declaring a requirement

Export the helper from the route module's `middleware` array.

```ts
// src/pages/ReportsPage.tsx
import { requireRoles } from '@equinor/fusion-framework-react-router';

// Every listed role is required (the default mode is 'all').
export const middleware = [requireRoles(['Reports.Read'])];
```

```ts
// At least one listed role is required.
export const middleware = [requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })];
```

Role gates can be combined with your own middleware in the same array. They run in array order.

### Role names

- Names are exact Roles V2 access-role names and are case-sensitive. `reports.read` does not match `Reports.Read`.
- Surrounding whitespace is trimmed and duplicates are removed. Declaration order is kept.
- `requireRoles` throws a `TypeError` when the route module loads if:
  - the list is empty or is not an array
  - a name is blank or is not a string
  - `mode` is not `'all'` or `'any'`, or `options` is not an object

## Requirements

- Enable the Roles module in the app configuration with `enableRoles(configurator)` from `@equinor/fusion-framework-module-roles`. The middleware reads `fusion.modules.roles`.
- The decision is made by the provider's `hasAccessRole`. Only global assignments satisfy a name-only requirement, as on the backend.

## When the check runs

- The check runs on every middleware execution:
  - initial load and later navigations
  - revalidations
  - fetcher loads
  - form and fetcher submissions
  It also runs for component-only routes without loaders.
- The check uses the provider's normal caching.
- While the check is pending, the route is not committed. No protected loader, action or component runs.
- If the operation is cancelled, for example by a newer navigation, the result is discarded and the chain does not continue.

## Nested routes

Every matched route's middleware must pass, so requirements on parent and child routes combine with AND. A child route cannot weaken a parent requirement. For example, a child with `{ mode: 'any' }` still needs every role its parent requires.

```ts
// layout module
export const middleware = [requireRoles(['App.Access'])];

// child page module: needs App.Access AND (Reports.Read OR Reports.Admin)
export const middleware = [requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })];
```

## Outcomes and errors

When the requirement is not met, the middleware throws `RequireRolesError`. It renders in the nearest error element. `reason` tells you which case applies.

| `reason` | Meaning | `cause` |
|---|---|---|
| `denied` | The provider answered and the requirement is not met. `missingAccessRoles` lists the roles the provider reported missing. | The provider's `RequiredAccessRolesError`, which carries the Roles provider for access-recovery UI. |
| `check-failed` | The provider could not answer, for example because of a network, service or response error. Access is unknown and the route is not loaded. This is not a denial. | The provider error (a `RolesError`). |
| `not-configured` | The Roles module is not enabled. This is a configuration error. | — |

The middleware never treats a failure as access, and it never denies silently.

```tsx
import { RequireRolesError, type ErrorElementProps } from '@equinor/fusion-framework-react-router';

export function ErrorElement({ error }: ErrorElementProps) {
  if (RequireRolesError.is(error) && error.reason === 'denied') {
    return <p>You need access: {error.missingAccessRoles.join(', ')}</p>;
  }
  if (RequireRolesError.is(error) && error.reason === 'check-failed') {
    return <p>Could not check your access. Try again later.</p>;
  }
  throw error;
}
```

> [!IMPORTANT]
> Route checks protect the UI only. Backend APIs must still authorize every request.

## Recovering access

`useRequireRolesRecovery(error)` connects a `denied` error to the existing Roles recovery UI, `RoleErrorView` from `@equinor/fusion-framework-react-components-roles`. That view lists the missing roles and lets the user activate a claimable role assignment. It calls `onRetry` only after an activation succeeded.

```tsx
import { useRouteError } from 'react-router';
import { RoleErrorView } from '@equinor/fusion-framework-react-components-roles';
import { useRequireRolesRecovery } from '@equinor/fusion-framework-react-router';

export function ErrorElement() {
  const error = useRouteError();
  const recovery = useRequireRolesRecovery(error);
  if (recovery && error instanceof Error) {
    return <RoleErrorView error={error} onRetry={recovery.retry} />;
  }
  return <p>Something went wrong.</p>;
}
```

The hook returns `undefined` for every error that activation cannot fix: `check-failed`, `not-configured`, other errors, and denials raised outside a Fusion `Router`.

### What `retry` does

1. Checks the requirement again with `hasAccessRole(roles, { required, refresh: true })`, so the activation is observed even if the provider cached an older answer.
2. Stops if access is still denied (`still-denied`) or the check fails (`check-failed`). A later retry is allowed.
3. Stops if the denial is no longer relevant (`stale`): the router was disposed, another navigation is in progress, or the router no longer shows this error.
4. Re-runs the denied operation once (`retried`), as described below.

| `operation` | Denied operation | What `retry` runs |
|---|---|---|
| `navigation` | Initial load, link or `GET` navigation, history traversal, revalidation | Reloads the current location with a replace navigation. Middleware, loaders and components run again, including component-only routes and parent gates. |
| `submission` | `<Form>` or `useSubmit` action | Submits the same request once more to the same URL, as a replace navigation. |
| `fetcher-submission` | `fetcher.submit` or `<fetcher.Form>` action | Submits the same request once more through the same fetcher key and route, then reloads the current location. |
| `fetcher-load` | `fetcher.load` | Does not replay the load. It reloads the current location to restore the fetcher's owner (`restored`), which can load again. |

`status` is `idle` before a retry, `checking` while it runs, then one of `retried`, `restored`, `still-denied`, `check-failed`, `stale` or `cancelled`.

### Safety

- Every retry still passes through every gate again. A child activation cannot bypass a parent requirement that is still missing.
- A recovery replays at most once. Double clicks share one attempt, and a later call returns the earlier result without submitting again.
- Unmounting the error element, or showing a different error, cancels its pending retry. The result of a late check is discarded and nothing is replayed.
- Recoveries belong to the `Router` instance and the denial that created them. They never act on another router or route.
- If the replayed operation is denied again, the router shows a new denial with its own recovery.

### Limitations

- A denial unmounts the fetcher's owner, and the remounted owner gets a new fetcher key. React Router keeps fetcher results per key, so the data of a replayed fetcher action is not delivered to the new owner, and a `fetcher.load` is not replayed. Only the router's private fetcher APIs could re-attach the result.
- A provider that returns `false` instead of throwing gives a denial with no `RequiredAccessRolesError` cause, so `RoleErrorView` renders nothing for it. The hook still offers `retry` for your own UI.

## Inspectable metadata

`requireRoles` attaches its normalized requirement to the middleware function. Do not repeat it in `handle.route`.

```ts
import { getRouteMiddlewareMetadata } from '@equinor/fusion-framework-react-router';

getRouteMiddlewareMetadata(requireRoles([' Reports.Read ', 'Reports.Read']));
// { kind: 'roles', mode: 'all', roles: ['Reports.Read'] }

getRouteMiddlewareMetadata(myCustomMiddleware);
// { kind: 'custom' }
```

- Other middleware is reported as `{ kind: 'custom' }`. It is opaque and must not be read as an authorization requirement.
- The metadata is stored under a registered symbol. The property is read-only and non-enumerable, so it never shows up in serialized route objects.

### Static recognition for build tools

Build tools must not run page modules or serialize functions. The React-free entry point `@equinor/fusion-framework-react-router/middleware-metadata` exports what a build consumer such as the route manifest producer needs:

- `requireRolesStaticContract` describes what to recognise. In a route module's `middleware` export array, look for a call to the named import `requireRoles` from `@equinor/fusion-framework-react-router` (an alias is allowed). The call must have:
  - an array literal of string literals as the first argument
  - optionally an object literal `{ mode: 'all' | 'any' }` as the second argument
- `normalizeRolesRequirement(roles, options)` applies the same validation and normalization as the runtime helper. Use it on the extracted literals so published metadata matches runtime behaviour.
- The types `RouteMiddlewareMetadata`, `RolesMiddlewareMetadata` and `CustomMiddlewareMetadata` describe the result.

Report any other entry as `{ kind: 'custom' }`. This includes calls with non-literal arguments and calls to a `requireRoles` imported from somewhere else.

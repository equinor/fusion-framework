# Migrate a portal roles flyout

Use `@equinor/fusion-framework-react-components-roles` when a portal currently owns its own Roles V2
HTTP client, account lookup, polling, and activation state. This guide describes adopting a **new,
initially unpublished package**, not upgrading an existing release of the React components.
See the [README](../README.md) for setup, peers, hook contracts, and screenshots.

## Divide responsibilities before migrating

| Responsibility | New owner |
| --- | --- |
| Service discovery, current-account resolution, Roles V2 requests and cache | Roles module and its client |
| Active and claimable collections, mutation state, visible-page refresh | React `RolesProvider` |
| Narrow Claimable, Active, and Expired tabs, audit dialog and role details | `<RolesView compact />` |
| Portal navigation, flyout chrome, and placement | Portal |
| Recovery of application initialization failures | Host `RoleBoundary` around the application loader |
| Authorization of protected operations | Trusted backend |

The module `RolesProvider` class and React `RolesProvider` component have the same name but different
jobs. Configure the module with `enableRoles`; import the React component from
`@equinor/fusion-framework-react-components-roles`.

## Add and configure the Roles packages

After publication, add the packages to the portal and satisfy the [peer requirements](../README.md#setup-and-peer-dependencies):

```sh
pnpm add @equinor/fusion-framework-module-roles @equinor/fusion-framework-react-components-roles
```

Before publication, use repository workspace dependencies. In this monorepo, dependencies use
`workspace:^` in `package.json` and require matching TypeScript project references.

Register Roles in the framework configuration that supplies the portal React module context:

```ts
import type { FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableRoles } from '@equinor/fusion-framework-module-roles';

/** Enables shared Roles V2 access for the portal. */
export const configure = (configurator: FrameworkConfigurator): void => {
  enableRoles(configurator);
};
```

The default client resolves the fixed `rolesv2` service through local or inherited service discovery.
Authentication supplies the current account; neither `RolesProvider` nor `RolesView` takes an
application key or account identifier.

If the portal needs custom transport instead of service discovery, configure `builder.setClient`
with a complete `IRolesClient`. The client contract uses cold, single-result observables; the module
provider exposes promises. Keep transport and account resolution out of presentation components.
See the [Roles module README](../../../../modules/roles/README.md) for client setup.

## Replace local request state with the compact view

Replace local active/claimable collection state, effects, account lookup, and activation handlers.
Keep the portal's navigation and flyout chrome. A minimal replacement is:

```tsx
import type { ReactElement } from 'react';
import { RolesProvider, RolesView } from '@equinor/fusion-framework-react-components-roles';

/** Keeps portal navigation separate from the shared role lifecycle. */
export const RolesSheetContent = ({ onBack }: { onBack: () => void }): ReactElement => (
  <section>
    <button type="button" onClick={onBack}>Back</button>
    <h2>My roles</h2>
    <RolesProvider>
      <RolesView compact />
    </RolesProvider>
  </section>
);
```

The component must be below the configured Fusion module context. If a React `RolesProvider` already
surrounds the flyout in the same tree, reuse it instead of nesting another independent store. Place it
above frequently opened and closed flyout content when role snapshots and expiry history should survive
closing the flyout. Unmounting a provider discards that UI state and stops its refresh listeners.

Remove the replaced portal-specific Roles client, duplicate collection state, polling, and activation
components when no other consumers need them. Keeping both implementations creates competing refresh
and error ownership. Keep portal-specific tests for navigation and integration; use the shared package's
components rather than duplicating their internals.

### Preserve identifier and mutation semantics

- Activation and deactivation take a **claimable assignment ID**, not a role name.
  Guard optional `assignment.id` values in custom hook controls.
- Access requirements take exact, case-sensitive **access-role names**, not assignment IDs.
- Claimable includes active claims, whose checked switches deactivate them. Active is informational.
- Expired contains the three newest eligible assignments from the previous seven days; overflow
  remains in Claimable. Entitlement validity is distinct from the previous activation's expiry.
- Compact date labels use the browser's locale and time zone through `Intl.DateTimeFormat`.
  Missing dates use `No expiration date`; malformed dates use `Invalid expiration date` and do not
  qualify an assignment for an Expired shortcut. Shared ISO parsing preserves date-only UTC and
  offsetless date-time local interpretation.

Both mutation actions wait for active and claimable refresh attempts. If the mutation fails, its
promise rejects and its mutation error is exposed. If only a subsequent read fails, the mutation
still succeeds; collection state reports the refresh failure and retains its previous snapshot.
Do not retry activation to repair a read failure. Hook `reload()` resolves on collection failures
and reports them through `error`, but rejects on store disposal. Catch rejected event-handler promises;
see the [safe hook examples](../README.md#show-active-roles).

## Place recovery around the host loader

An application may declare bootstrap requirements using `builder.requireRoles(['Reports.Read'])`.
If a requirement fails before the application mounts, its own React provider cannot recover it.
Place `RoleBoundary` in the **host** React tree around the application loader:

```tsx
import type { ReactElement, ReactNode } from 'react';
import { RoleBoundary } from '@equinor/fusion-framework-react-components-roles';

/** Owns role failures surfaced by the host's application loader. */
export const ApplicationRecovery = ({ children }: { children: ReactNode }): ReactElement => (
  <RoleBoundary>{children}</RoleBoundary>
);
```

Render the loader as `children` and ensure it surfaces initialization errors to this boundary.
Recovery follows the provider attached to the original `RequiredRolesError`, including through an
error cause chain; it does not substitute the portal overview's provider for the application's provider.
Metadata failures offer a local retry without restarting the application. Activation failures retain
audit input in the dialog and do not retry the loader. Successful activation resets the boundary so
the loader can retry; unrelated errors remain owned by an outer application error boundary.

This differs from **in-place expiry recovery** in a mounted `RolesProvider`. Successful collection
refreshes can queue newly expired assignments, one dialog at a time, without reloading the portal or
remounting the application. Dismissal applies to the observed activation period. Intentional
deactivation through the hook suppresses that period's expiry prompt.

`RoleBoundary required={...}` is a pre-mount UI check, not a continuous authorization mechanism.
Changed requirements or a changed module provider trigger a new check before children mount.
Polling does not invalidate an already successful check. Enforce all protected operations on the backend.

## Verify the integration

- The flyout and its React provider use the intended Fusion module context.
- Loading, empty collections, stale snapshots, and retryable collection failures are visible.
- Claimable supports activation and deactivation; Active remains informational.
- More than three recently expired assignments remain reachable across Expired and Claimable.
- Activation failures preserve reason and duration, and never trigger loader retry.
- Successful mutation plus failed refresh is shown as a read failure, not a failed activation.
- Focus and visibility refreshes do not erase open audit input.
- Expiry recovery stays in place; provider replacement clears old snapshots and recovery history.
- Bootstrap recovery is in the host tree and uses the failing application's provider.
- No flyout component resolves account identifiers or calls Roles V2 endpoints directly.
- Backend authorization remains independent of the UI's role snapshot.

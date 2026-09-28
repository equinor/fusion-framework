# Roles V2 React integration

Use `useHasAccessRole` for active-only UI gates. Use `useAccessRole` when a component also needs
to discover and activate a claimable role assignment.

The host or application must enable `@equinor/fusion-framework-module-roles` before rendering a
component that uses either hook.

## Check active access roles

`useHasAccessRole` checks a readonly list of exact, case-sensitive Roles V2 access-role names. It
calls only `IRolesProvider.hasAccessRole`, so mounting and refreshing the hook do not query
claimable-role assignments.

Set `required: false` for any-role access or `required: true` for all-role access. The result keeps
`hasAccessRole` undefined during the initial request, exposes failures through `error`, and provides
`refresh` for an explicit recheck. A refresh keeps the current result visible while loading, but a
provider or role-input change clears it immediately so access from an earlier request is never
rendered for new inputs.

```tsx
import { useHasAccessRole } from '@equinor/fusion-framework-react-app/roles';

export const ReportsNavigation = () => {
  const access = useHasAccessRole(['Reports.Read', 'Reports.Export'], { required: false });

  if (access.isLoading) return <p>Checking access...</p>;
  if (access.error) return <p>Could not check access.</p>;

  return access.hasAccessRole ? <ReportsLink /> : null;
};
```

This hook supports role-aware visibility and read-only states only. Trusted backend services remain
authoritative for protected operations.

## Check and claim one access role

`useAccessRole` is the claim-capable API. It intentionally checks both active access and claimable
assignments, and it exposes activation actions and their state.

```tsx
import { useAccessRole } from '@equinor/fusion-framework-react-app/roles';

export const ReportsAccess = ({ claimableRoleId }: { claimableRoleId: string }) => {
  const role = useAccessRole('Reports.Read');

  if (role.isChecking) return <p>Checking access...</p>;
  if (role.checkError) return <p>Could not check access.</p>;
  if (role.hasAccessRole) return <Reports />;
  if (!role.hasClaimableRoleAssignmentForAccessRole) return <p>Access is unavailable.</p>;

  /** Consumes the event-handler rejection; activationError below owns the visible failure. */
  const handleActivate = (): void => {
    void role
      .activateClaimableRoleAssignment({
        assignmentId: claimableRoleId,
        reason: 'Open reports',
        hours: 2,
      })
      .catch(() => undefined);
  };

  return (
    <>
      {role.activationError ? <p role="alert">{String(role.activationError)}</p> : null}
      <button disabled={role.isActivating} onClick={handleActivate}>
        Claim access
      </button>
    </>
  );
};
```

`useAccessRole` checks the exact, case-sensitive Roles V2 access-role name and claimability when
mounted. It exposes separate loading and error states for checks and claims. After a successful
claim, the hook checks the role again using the provider's refreshed caches.
Activation requires a claimable assignment ID, a non-empty audit reason, and an integer duration
from 1 through 24 hours.
`activateClaimableRoleAssignment` rejects on failure as well as setting `activationError`; React
event handlers must consume that rejection and render the mutation error so users can retry.

For required-role recovery UI, use `AccessRoleBoundary` from
`@equinor/fusion-framework-react-components-roles`. Its optional `requiredAccessRoles` prop can
guard a subtree proactively; without it, the boundary handles `RequiredAccessRolesError` instances
thrown by descendants.

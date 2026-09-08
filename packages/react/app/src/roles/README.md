# Roles V2 React integration

Use `useAccessRole` when a component needs to check and claim one access role.

The host or application must enable `@equinor/fusion-framework-module-roles` before rendering a
component that uses this hook.

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
      .activateClaimableRoleAssignment({ assignmentId: claimableRoleId, reason: 'Open reports' })
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

`useAccessRole` checks the exact, case-sensitive Roles V2 access-role name when mounted. It exposes
separate loading and error states for checks and claims. After a successful claim, the hook checks
the role again using the provider's refreshed caches.
`activateClaimableRoleAssignment` rejects on failure as well as setting `activationError`; React event handlers must consume
that rejection and render the mutation error so users can retry.

For required-role recovery UI, use `AccessRoleBoundary` from
`@equinor/fusion-framework-react-components-roles`. Its optional `requiredAccessRoles` prop can guard a subtree
proactively; without it, the boundary handles `RequiredAccessRolesError` instances thrown by descendants.

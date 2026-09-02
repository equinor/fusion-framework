# Roles V2 React hook

Use `useRole` to check whether the signed-in account has an access role, determine whether the
access role can be claimed, and activate a claimable role assignment.

The host or application must enable `@equinor/fusion-framework-module-roles` before rendering a
component that uses this hook.

```tsx
import { useRole } from '@equinor/fusion-framework-react-app/roles';

export const ReportsAccess = ({ claimableRoleId }: { claimableRoleId: string }) => {
  const role = useRole('Reports.Read');

  if (role.isChecking) return <p>Checking access...</p>;
  if (role.checkError) return <p>Could not check access.</p>;
  if (role.hasRole) return <Reports />;
  if (!role.canClaimAccessRole) return <p>Access is unavailable.</p>;

  return (
    <button
      disabled={role.isClaiming}
      onClick={() => role.claimRole({ roleId: claimableRoleId, reason: 'Open reports' })}
    >
      Claim access
    </button>
  );
};
```

`useRole` checks the exact, case-sensitive Roles V2 access-role name when mounted. It exposes
separate loading and error states for checks and claims. After a successful claim, the hook checks
the role again using the provider's refreshed caches.

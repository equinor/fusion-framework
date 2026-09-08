import type { ReactNode } from 'react';
import { Button, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';
import { CheckingRolesView } from './CheckingRolesView';
import { RoleClaimableView } from './RoleClaimableView';
import { RoleDoesNotExistView } from './RoleDoesNotExistView';
import { RoleNotClaimableView } from './RoleNotClaimableView';
import { useRequiredAccessRoleRecovery } from './useRequiredAccessRoleRecovery';

const Styled = {
  Recovery: styled.div`
    display: grid;
    gap: 1rem;
    justify-items: start;
  `,
};

/** Recovery inputs when required Roles V2 access blocks an application. */
export interface RoleErrorViewProps {
  /** Error raised while loading or rendering the application. */
  readonly error: Error;
  /** Restarts application rendering after a role activation succeeds. */
  readonly onRetry: VoidFunction;
}

/**
 * Renders recovery controls for application failures caused by missing required access roles.
 *
 * Distinguishes unregistered access roles, access roles with no claimable role assignment, and
 * access roles the account can claim. Successful activation retries the failed application render;
 * rejected activation stays in the dialog. Metadata failures offer a local read retry without
 * restarting the host or asserting missing access.
 *
 * @param props - Application error and retry callback.
 * @returns Required-access-role recovery controls, or nothing for an unrelated error.
 * @example
 * ```tsx
 * <RoleErrorView error={error} onRetry={retryApplication} />
 * ```
 */
export const RoleErrorView = ({ error, onRetry }: RoleErrorViewProps): ReactNode => {
  const recovery = useRequiredAccessRoleRecovery(error, onRetry);
  // The host chooses its generic fallback when this is not a required-access-role failure.
  if (!recovery.isRequiredAccessRolesError) {
    return null;
  }
  // Keep the access decision explicit while role metadata is resolved.
  if (recovery.isLoading) {
    return <CheckingRolesView />;
  }
  // A failed lookup is not evidence of missing or non-claimable access.
  if (recovery.statusError) {
    return (
      <Styled.Recovery>
        <Typography group="heading" variant="h2">
          Unable to check required access roles
        </Typography>
        <Typography role="alert">{recovery.statusError}</Typography>
        {recovery.canRetryStatuses && (
          <Button onClick={recovery.retryStatuses}>Retry access check</Button>
        )}
      </Styled.Recovery>
    );
  }
  return (
    <div>
      <Typography group="heading" variant="h2">
        Access denied
      </Typography>
      <RoleDoesNotExistView statuses={recovery.statuses} />
      <RoleNotClaimableView statuses={recovery.statuses} />
      <RoleClaimableView
        statuses={recovery.statuses}
        defaultReason="Required to access this application"
        activatingAssignmentId={recovery.activatingAssignmentId}
        onActivate={recovery.activateClaimableRoleAssignment}
      />
    </div>
  );
};

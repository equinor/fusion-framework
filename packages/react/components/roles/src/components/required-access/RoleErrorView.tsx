import type { ReactNode } from 'react';
import { Button } from '@equinor/eds-core-react';
import styled from 'styled-components';
import { CheckingRolesView } from './CheckingRolesView';
import { RoleClaimableView } from './RoleClaimableView';
import { RoleDoesNotExistView } from './RoleDoesNotExistView';
import { RoleNotClaimableView } from './RoleNotClaimableView';
import { useRoleRecovery } from './useRoleRecovery';

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
 * Renders recovery controls for application failures caused by missing required roles.
 *
 * Distinguishes unregistered roles, roles the account cannot claim, and claimable roles.
 * Successful activation retries the failed application render; rejected activation stays in the dialog.
 * Metadata failures offer a local read retry without restarting the host or asserting missing access.
 *
 * @param props - Application error and retry callback.
 * @returns Required-role recovery controls, or nothing for an unrelated error.
 * @example
 * ```tsx
 * <RoleErrorView error={error} onRetry={retryApplication} />
 * ```
 */
export const RoleErrorView = ({ error, onRetry }: RoleErrorViewProps): ReactNode => {
  const recovery = useRoleRecovery(error, onRetry);
  // The host chooses its generic fallback when this is not a required-role failure.
  if (!recovery.isRoleError) {
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
        <h2>Unable to check required roles</h2>
        <p role="alert">{recovery.statusError}</p>
        {recovery.canRetryStatuses && (
          <Button onClick={recovery.retryStatuses}>Retry role check</Button>
        )}
      </Styled.Recovery>
    );
  }
  return (
    <div>
      <h2>Access denied</h2>
      <RoleDoesNotExistView statuses={recovery.statuses} />
      <RoleNotClaimableView statuses={recovery.statuses} />
      <RoleClaimableView
        statuses={recovery.statuses}
        defaultReason="Required to access this application"
        claimingAssignmentId={recovery.claimingAssignmentId}
        onClaim={recovery.claimRole}
      />
    </div>
  );
};

import type { ReactNode } from 'react';
import { Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

import {
  useActiveAccessRoleAssignments,
  useClaimableRoleAssignments,
} from '@equinor/fusion-framework-react-components-roles';

import { ActiveAccessRoleAssignments } from './components/ActiveAccessRoleAssignments';
import { ConsolidatedClaimableRoleAssignments } from './components/ConsolidatedClaimableRoleAssignments';

const Styled = {
  Page: styled.main`
    display: grid;
    gap: 1.5rem;
    max-width: 60rem;
    margin: 0 auto;
    padding: 2rem;
    font-family: sans-serif;
  `,
  Error: styled(Typography)`
    color: #b30d2f;
  `,
};

/**
 * Displays active and claimable roles and claims access through the app-scoped Roles provider.
 *
 * @returns The Roles V2 cookbook interface.
 *
 * @example
 * ```tsx
 * <App />
 * ```
 */
export const App = (): ReactNode => {
  const active = useActiveAccessRoleAssignments();
  const claimable = useClaimableRoleAssignments();

  /**
   * Claims an assignment and refreshes the independently rendered active roles.
   *
   * @param assignmentId - Claimable assignment identifier.
   * @returns A promise that resolves after both role domains are current.
   */
  const handleActivate = async (assignmentId: string): Promise<void> => {
    await claimable.activateClaimableRoleAssignment({
      assignmentId,
      reason: 'Claimed from the Fusion Framework Roles cookbook',
    });
  };

  const hasAssignments = active.assignments.length > 0 || claimable.assignments.length > 0;
  // Replace the view only on first load; background refreshes retain the last usable snapshot.
  if ((active.isLoading || claimable.isLoading) && !hasAssignments) {
    return (
      <Styled.Page>
        <Typography>Loading active and claimable roles...</Typography>
      </Styled.Page>
    );
  }

  const loadError = active.error ?? claimable.error;
  return (
    <Styled.Page>
      <header>
        <Typography group="heading" variant="h1">
          Fusion Roles V2
        </Typography>
        <Typography>
          This app requires <code>ProView.Admin.DevOps</code> before initialization completes.
        </Typography>
      </header>

      {loadError ? (
        <>
          <Styled.Error>
            Some role data could not be refreshed. Displayed assignments may be stale:{' '}
            {String(loadError)}
          </Styled.Error>
          <button
            type="button"
            onClick={() => void Promise.all([active.reload(), claimable.reload()])}
          >
            Retry
          </button>
        </>
      ) : null}
      <ActiveAccessRoleAssignments assignments={active.assignments} />
      <ConsolidatedClaimableRoleAssignments
        assignments={claimable.assignments}
        isActivating={claimable.isActivating}
        error={claimable.activationError}
        onActivate={handleActivate}
      />
    </Styled.Page>
  );
};

export default App;

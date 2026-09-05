import type { ReactNode } from 'react';
import styled from 'styled-components';

import { useClaimableRoles, useRoles } from '@equinor/fusion-framework-react-components-roles';

import { ActiveRoles } from './components/ActiveRoles';
import { ClaimableRoles } from './components/ClaimableRoles';

const Styled = {
  Page: styled.main`
    display: grid;
    gap: 1.5rem;
    max-width: 60rem;
    margin: 0 auto;
    padding: 2rem;
    font-family: sans-serif;
  `,
  Error: styled.p`
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
  const active = useRoles();
  const claimable = useClaimableRoles();

  /**
   * Claims an assignment and refreshes the independently rendered active roles.
   *
   * @param roleId - Claimable assignment identifier.
   * @returns A promise that resolves after both role domains are current.
   */
  const handleClaim = async (roleId: string): Promise<void> => {
    await claimable.claimRole({
      roleId,
      reason: 'Claimed from the Fusion Framework Roles cookbook',
    });
  };

  // Both role domains must resolve before the cookbook renders either collection.
  if (active.isLoading || claimable.isLoading) {
    return <Styled.Page>Loading active and claimable roles...</Styled.Page>;
  }

  const loadError = active.error ?? claimable.error;
  // A collection failure replaces stale content with one retry for both role domains.
  if (loadError) {
    return (
      <Styled.Page>
        <Styled.Error>Failed to load role lists: {String(loadError)}</Styled.Error>
        <button
          type="button"
          onClick={() => void Promise.all([active.reload(), claimable.reload()])}
        >
          Retry
        </button>
      </Styled.Page>
    );
  }

  return (
    <Styled.Page>
      <header>
        <h1>Fusion Roles V2</h1>
        <p>
          This app requires <code>ProView.Admin.DevOps</code> before initialization completes.
        </p>
      </header>

      <ActiveRoles roles={active.roles} />
      <ClaimableRoles
        roles={claimable.roles}
        isClaiming={claimable.isClaiming}
        error={claimable.claimError}
        onClaim={handleClaim}
      />
    </Styled.Page>
  );
};

export default App;

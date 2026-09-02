import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import type { IRolesProvider, RolesModule } from '@equinor/fusion-framework-module-roles';
import { useAppModule } from '@equinor/fusion-framework-react-app';
import { useRole } from '@equinor/fusion-framework-react-app/roles';

const TARGET_ACCESS_ROLE = 'Reports.Export';

type ActiveRoles = Awaited<ReturnType<IRolesProvider['getActiveRoles']>>;
type ClaimableRoles = Awaited<ReturnType<IRolesProvider['getClaimableRoles']>>;

const Styled = {
  Page: styled.main`
    display: grid;
    gap: 1.5rem;
    max-width: 60rem;
    margin: 0 auto;
    padding: 2rem;
    font-family: sans-serif;
  `,
  Section: styled.section`
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #d5d5d5;
    border-radius: 0.5rem;
  `,
  List: styled.ul`
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding-left: 1.25rem;
  `,
  ClaimRow: styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
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
export const App = () => {
  const roles = useAppModule<RolesModule>('roles');
  const role = useRole(TARGET_ACCESS_ROLE);
  const [activeRoles, setActiveRoles] = useState<ActiveRoles>([]);
  const [claimableRoles, setClaimableRoles] = useState<ClaimableRoles>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [listError, setListError] = useState<unknown>();

  /**
   * Refreshes both role lists from the provider so the UI follows successful claims.
   *
   * @returns A promise that resolves after list state is updated.
   */
  const loadRoles = useCallback(async (): Promise<void> => {
    setIsLoadingLists(true);
    setListError(undefined);
    try {
      const [nextActiveRoles, nextClaimableRoles] = await Promise.all([
        roles.getActiveRoles(),
        roles.getClaimableRoles(),
      ]);
      setActiveRoles(nextActiveRoles);
      setClaimableRoles(nextClaimableRoles);
    } catch (error) {
      setListError(error);
    } finally {
      setIsLoadingLists(false);
    }
  }, [roles]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  /**
   * Claims an assignment and refreshes the visible lists after activation.
   *
   * @param roleId - Claimable assignment identifier.
   * @returns A promise that resolves after the claim and list refresh complete.
   */
  const claimRole = async (roleId: string): Promise<void> => {
    try {
      await role.claimRole({
        roleId,
        reason: 'Claimed from the Fusion Framework Roles cookbook',
      });
      await loadRoles();
    } catch {
      // useRole exposes the original failure through claimError for the rendered error state.
    }
  };

  // Keep unresolved list state distinct from a valid empty result.
  if (isLoadingLists) {
    return <Styled.Page>Loading active and claimable roles...</Styled.Page>;
  }

  // A list failure replaces stale content with an explicit recovery action.
  if (listError) {
    return (
      <Styled.Page>
        <Styled.Error>Failed to load role lists: {String(listError)}</Styled.Error>
        <button type="button" onClick={loadRoles}>
          Retry
        </button>
      </Styled.Page>
    );
  }

  // Prepare role labels before markup so the rendered section remains presentational.
  const activeRoleItems = activeRoles.map((assignment) => (
    <li
      key={`${assignment.systemName}:${assignment.accessRoleName}:${assignment.assignmentType}:${assignment.activeToDate}`}
    >
      {assignment.systemName ?? 'Unknown system'} / {assignment.accessRoleName ?? 'Unknown role'}
    </li>
  ));
  // Each claimable row retains the assignment id needed by the activation request.
  const claimableRoleItems = claimableRoles.map((assignment) => {
    const roleId = assignment.id;
    const label =
      assignment.claimableRole?.displayName ??
      assignment.claimableRole?.name ??
      assignment.claimableRole?.id ??
      'Unknown claimable role';
    return (
      <Styled.ClaimRow
        key={`${roleId}:${assignment.claimableRole?.id}:${assignment.validFrom}:${assignment.validTo}`}
      >
        <span>{label}</span>
        <button
          type="button"
          disabled={!roleId || role.isClaiming}
          onClick={() => roleId && void claimRole(roleId)}
        >
          {role.isClaiming ? 'Claiming...' : 'Claim'}
        </button>
      </Styled.ClaimRow>
    );
  });

  return (
    <Styled.Page>
      <header>
        <h1>Fusion Roles V2</h1>
        <p>
          This app required <code>Reports.Read</code> before initialization completed.
        </p>
      </header>

      <Styled.Section>
        <h2>Check one access role</h2>
        {role.isChecking ? (
          <p>Checking {TARGET_ACCESS_ROLE}...</p>
        ) : (
          <p>
            {TARGET_ACCESS_ROLE}: {role.hasRole ? 'active' : 'not active'}
          </p>
        )}
        {role.checkError ? <Styled.Error>{String(role.checkError)}</Styled.Error> : null}
        {!role.hasRole && role.canClaimAccessRole ? (
          <p>A claimable assignment can grant this access role.</p>
        ) : null}
        {role.claimError ? <Styled.Error>{String(role.claimError)}</Styled.Error> : null}
      </Styled.Section>

      <Styled.Section>
        <h2>Active roles</h2>
        {activeRoleItems.length > 0 ? (
          <Styled.List>{activeRoleItems}</Styled.List>
        ) : (
          <p>No active roles.</p>
        )}
      </Styled.Section>

      <Styled.Section>
        <h2>Claimable roles</h2>
        {claimableRoleItems.length > 0 ? (
          <Styled.List>{claimableRoleItems}</Styled.List>
        ) : (
          <p>No claimable roles.</p>
        )}
      </Styled.Section>
    </Styled.Page>
  );
};

export default App;

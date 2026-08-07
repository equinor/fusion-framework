import {
  Banner,
  Button,
  CircularProgress,
  Divider,
  Icon,
  Tabs,
  Typography,
} from '@equinor/eds-core-react';
import { arrow_back, verified_user } from '@equinor/eds-icons';
import { useFramework } from '@equinor/fusion-framework-react';
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks';
import { type ReactElement, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import type { SheetContentProps } from '../types';
import { ClaimableRole } from './ClaimableRole';
import { RolesApi, type ClaimableRoleAssignment, type PermanentRoleAssignment } from './RolesApi';

Icon.add({ arrow_back, verified_user });

const Styled = {
  Content: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0.5rem;
  `,
  Role: styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem;
  `,
  Indicator: styled.div<{ $active: boolean }>`
    width: 0.25rem;
    height: 2.5rem;
    background: ${({ $active }) => ($active ? '#007079' : '#dcdcdc')};
  `,
};

/**
 * Displays the signed-in user's consolidated claimable and permanent Fusion roles.
 *
 * The role collections use the same Roles V2 endpoints as the production portal.
 *
 * @param props.navigate - Navigates back to the person side sheet landing page.
 * @returns A tabbed role overview with loading, error, and empty states.
 */
export const RolesSheetContent = ({ navigate }: SheetContentProps): ReactElement => {
  const framework = useFramework();
  const user = useCurrentUser();
  const [tab, setTab] = useState(0);
  const [claimableRoles, setClaimableRoles] = useState<ClaimableRoleAssignment[]>([]);
  const [permanentRoles, setPermanentRoles] = useState<PermanentRoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [loadAttempt, setLoadAttempt] = useState(0);
  const latestLoadAttempt = useRef(loadAttempt);
  latestLoadAttempt.current = loadAttempt;

  /** Starts a fresh role request after a retrieval failure. */
  const handleRetry = (): void => {
    setError(undefined);
    setIsLoading(true);
    setLoadAttempt((attempt) => attempt + 1);
  };

  /**
   * Replaces a changed assignment after activation or deactivation succeeds.
   * @param changedAssignment - Updated claimable assignment returned by the role row.
   */
  const handleClaimableRoleChange = (changedAssignment: ClaimableRoleAssignment): void => {
    setClaimableRoles((currentRoles) => {
      // Preserve the endpoint ordering while updating only the role that changed.
      return currentRoles.map((assignment) =>
        assignment.id === changedAssignment.id ? changedAssignment : assignment,
      );
    });
  };

  useEffect(() => {
    let isActive = true;
    const currentLoadAttempt = loadAttempt;

    /** Loads both role collections together so the tabs represent one consistent snapshot. */
    const loadRoles = async (): Promise<void> => {
      // A Roles V2 account identifier is required before either endpoint can be queried.
      if (!user?.localAccountId) {
        setError('Unable to resolve the signed-in Fusion account.');
        setIsLoading(false);
        return;
      }

      try {
        const client = await framework.modules.serviceDiscovery.createClient('rolesv2');
        const rolesApi = new RolesApi(client, user.localAccountId);
        const [claimable, permanent] = await Promise.all([
          rolesApi.getClaimableRoles(),
          rolesApi.getPermanentRoles(),
        ]);

        // Ignore a completed request after the side sheet content has unmounted.
        if (isActive && latestLoadAttempt.current === currentLoadAttempt) {
          setClaimableRoles(claimable);
          setPermanentRoles(permanent);
          setError(undefined);
        }
      } catch (cause) {
        // Keep transport details out of the side sheet while preserving a useful retry direction.
        if (isActive && latestLoadAttempt.current === currentLoadAttempt) {
          setError(cause instanceof Error ? cause.message : 'Failed to load roles.');
        }
      } finally {
        // Avoid updating state when navigation unmounts this sheet during a request.
        if (isActive && latestLoadAttempt.current === currentLoadAttempt) {
          setIsLoading(false);
        }
      }
    };

    void loadRoles();

    return () => {
      isActive = false;
    };
  }, [framework, user?.localAccountId, loadAttempt]);

  // Prepare role rows before markup so the tab panels only render presentation state.
  const claimableItems = claimableRoles.map((assignment) => (
    <ClaimableRole
      key={assignment.id}
      assignment={assignment}
      onChange={handleClaimableRoleChange}
    />
  ));

  // Permanent assignments include scope context but do not expose activation controls.
  const permanentItems = permanentRoles.map((assignment) => {
    const scope =
      !assignment.scope || assignment.scope.isGlobal ? 'Global' : assignment.scope.value;
    return (
      <Styled.Role key={assignment.id}>
        <Styled.Indicator $active={true} />
        <div>
          <Typography>{assignment.role.displayName}</Typography>
          <Typography variant="overline">
            {assignment.role.name}
            {scope ? ` (${scope})` : ''}
          </Typography>
        </div>
      </Styled.Role>
    );
  });

  return (
    <section>
      <Button variant="ghost" onClick={() => navigate()}>
        <Icon name="arrow_back" />
        <Icon name="verified_user" />
        My Roles
      </Button>
      <Divider />
      <Styled.Content>
        {isLoading ? (
          <CircularProgress aria-label="Loading roles" />
        ) : error ? (
          <>
            <Banner>
              <Banner.Message>{error}</Banner.Message>
            </Banner>
            <Button variant="outlined" onClick={handleRetry}>
              Retry
            </Button>
          </>
        ) : (
          <Tabs activeTab={tab} onChange={(index) => setTab(Number(index))}>
            <Tabs.List>
              <Tabs.Tab>Claimable</Tabs.Tab>
              <Tabs.Tab>Permanent</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
              <Tabs.Panel>
                {claimableItems.length > 0 ? (
                  claimableItems
                ) : (
                  <Typography>You have no available roles</Typography>
                )}
              </Tabs.Panel>
              <Tabs.Panel>
                {permanentItems.length > 0 ? (
                  permanentItems
                ) : (
                  <Typography>You have no permanent roles assigned</Typography>
                )}
              </Tabs.Panel>
            </Tabs.Panels>
          </Tabs>
        )}
      </Styled.Content>
    </section>
  );
};

import { useMemo, useState, type ReactNode } from 'react';
import { Banner, CircularProgress, Tabs, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

import { RoleClaimDialog } from '../claim/RoleClaimDialog';
import type { RoleDetails } from '../overview/role-details';
import { useRolesOverview } from '../overview/useRolesOverview';
import { RolesLoadFeedback } from '../overview/RolesLoadFeedback';
import { ClaimableRoleRow } from './ClaimableRoleRow';
import { CompactRoleRow } from './CompactRoleRow';
import { createCompactRoleGroups } from './create-compact-role-groups';
import { formatRoleDate } from './format-role-date';
import { RoleDetailsDialog } from './RoleDetailsDialog';

const Styled = {
  Content: styled.div`
    display: grid;
    gap: 1rem;
    padding: 1rem 0.5rem;
  `,
  RoleList: styled.div`
    display: grid;
  `,
};

/**
 * Displays active and claimable Roles V2 assignments in a compact flyout layout.
 * Claimable switches collect audit details; information buttons reveal metadata without expanding rows.
 * @returns A compact role overview backed by the nearest `RolesProvider`.
 */
export const CompactRolesView = (): ReactNode => {
  const overview = useRolesOverview();
  const { active, claimable, claimableRoles, selectedClaim, selectClaim } = overview;
  const [tab, setTab] = useState(0);
  const [selectedDetails, setSelectedDetails] = useState<RoleDetails>();
  // One timestamp governs the whole partition; tab and dialog changes must not reshuffle shortcuts.
  const groups = useMemo(
    () => createCompactRoleGroups(active.roles, claimableRoles, Date.now()),
    [active.roles, claimableRoles],
  );
  const rowControls = {
    isPending: claimable.isClaiming || claimable.isDeactivating,
    selectedAssignmentId: selectedClaim?.assignmentId,
    onShowInformation: setSelectedDetails,
    onSelectClaim: selectClaim,
    onDeactivate: overview.deactivateRole,
  };
  // Keep each tab's policy in its variant; row presentation and audit interaction stay shared.
  const claimableItems = groups.available.map((role) => (
    <ClaimableRoleRow key={role.assignmentId} role={role} variant="available" {...rowControls} />
  ));
  const claimedItems = groups.claimed.map((role) => (
    <ClaimableRoleRow key={role.assignmentId} role={role} variant="claimed" {...rowControls} />
  ));
  const expiredItems = groups.expired.map((role) => (
    <ClaimableRoleRow key={role.assignmentId} role={role} variant="expired" {...rowControls} />
  ));
  // Permanent access has no activation switch, but retains the same information affordance.
  const permanentItems = groups.permanent.map((role) => (
    <CompactRoleRow
      key={role.key}
      role={role}
      caption={`Permanent${role.activeTo ? ` · Expires ${formatRoleDate(role.activeTo)}` : ''}`}
      onShowInformation={setSelectedDetails}
    />
  ));

  // Only first-load progress may replace the view; background reads must retain audit forms.
  if (overview.isLoading) {
    return <CircularProgress aria-label="Loading roles" />;
  }
  return (
    <Styled.Content>
      <RolesLoadFeedback
        isRefreshing={overview.isRefreshing}
        error={overview.loadError}
        onRetry={overview.reload}
      />
      {claimable.claimError ? (
        <Banner>
          <Banner.Message>{String(claimable.claimError)}</Banner.Message>
        </Banner>
      ) : null}
      {claimable.deactivateError ? (
        <Banner>
          <Banner.Message>{String(claimable.deactivateError)}</Banner.Message>
        </Banner>
      ) : null}
      <Tabs activeTab={tab} onChange={(index) => setTab(Number(index))}>
        <Tabs.List>
          <Tabs.Tab>Claimable</Tabs.Tab>
          <Tabs.Tab>Active</Tabs.Tab>
          <Tabs.Tab>Expired</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            {claimableItems.length > 0 ? (
              <Styled.RoleList>{claimableItems}</Styled.RoleList>
            ) : (
              <Typography>
                {claimable.error
                  ? 'Claimable roles could not be loaded.'
                  : 'You have no available roles'}
              </Typography>
            )}
          </Tabs.Panel>
          <Tabs.Panel>
            {permanentItems.length > 0 || claimedItems.length > 0 ? (
              <Styled.RoleList>
                {claimedItems}
                {permanentItems}
              </Styled.RoleList>
            ) : (
              <Typography>
                {overview.loadError
                  ? 'Active roles could not be fully loaded.'
                  : 'You have no active roles'}
              </Typography>
            )}
          </Tabs.Panel>
          <Tabs.Panel>
            {expiredItems.length > 0 ? (
              <Styled.RoleList>{expiredItems}</Styled.RoleList>
            ) : (
              <Typography>
                {claimable.error
                  ? 'Expired roles could not be loaded.'
                  : 'You have no recently expired roles'}
              </Typography>
            )}
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
      <RoleClaimDialog
        claim={selectedClaim}
        defaultReason=""
        isClaiming={claimable.isClaiming}
        onClose={() => selectClaim(undefined)}
        onClaim={overview.claimRole}
      />
      {selectedDetails ? (
        <RoleDetailsDialog role={selectedDetails} onClose={() => setSelectedDetails(undefined)} />
      ) : null}
    </Styled.Content>
  );
};

import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RolesView } from '../RolesView';

const mocks = vi.hoisted(() => ({
  reloadActiveAccessRoleAssignments: vi.fn(),
  reloadConsolidatedClaimableRoleAssignments: vi.fn(),
  reloadConsolidatedRoleAssignments: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
  deactivateClaimableRoleAssignment: vi.fn(),
  useActiveAccessRoleAssignments: vi.fn(),
  useClaimableRoleAssignments: vi.fn(),
  useRoleAssignments: vi.fn(),
}));

vi.mock('../../hooks/useActiveAccessRoleAssignments', () => ({
  useActiveAccessRoleAssignments: mocks.useActiveAccessRoleAssignments,
}));

vi.mock('../../hooks/useClaimableRoleAssignments', () => ({
  useClaimableRoleAssignments: mocks.useClaimableRoleAssignments,
}));

vi.mock('../../hooks/useRoleAssignments', () => ({
  useRoleAssignments: mocks.useRoleAssignments,
}));

describe('CompactRolesView', () => {
  beforeEach(() => {
    mocks.reloadActiveAccessRoleAssignments.mockReset();
    mocks.reloadConsolidatedClaimableRoleAssignments.mockReset();
    mocks.reloadConsolidatedRoleAssignments.mockReset();
    mocks.activateClaimableRoleAssignment.mockReset();
    mocks.deactivateClaimableRoleAssignment.mockReset();
    mocks.useActiveAccessRoleAssignments.mockReset();
    mocks.useClaimableRoleAssignments.mockReset();
    mocks.useRoleAssignments.mockReset();
    mocks.reloadActiveAccessRoleAssignments.mockResolvedValue(undefined);
    mocks.reloadConsolidatedClaimableRoleAssignments.mockResolvedValue(undefined);
    mocks.reloadConsolidatedRoleAssignments.mockResolvedValue(undefined);
    mocks.activateClaimableRoleAssignment.mockResolvedValue({
      activeToDate: '2026-09-05T16:00:00Z',
    });
    mocks.deactivateClaimableRoleAssignment.mockResolvedValue({
      activeToDate: '2026-09-05T13:00:00Z',
    });
    mocks.useActiveAccessRoleAssignments.mockReturnValue({
      assignments: [],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadActiveAccessRoleAssignments,
    });
    mocks.useRoleAssignments.mockReturnValue({
      assignments: [],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadConsolidatedRoleAssignments,
    });
    mocks.useClaimableRoleAssignments.mockReturnValue({
      assignments: [
        {
          id: 'claimable-role',
          claimableRole: {
            name: 'reports-exporter',
            displayName: 'Reports exporter',
            description: 'Exports reports.',
          },
          isActive: false,
          reasons: ['Assigned through the Reports team'],
          validTo: '2026-12-31T16:00:00Z',
          scope: {
            isGlobal: false,
            value: 'Reports portfolio',
            scopeTypeIdentifier: 'project',
          },
        },
        {
          id: 'recently-expired-role',
          claimableRole: {
            name: 'recent-developer',
            displayName: 'Recent developer',
            description: 'Recently used development access.',
          },
          isActive: false,
          activeTo: new Date(Date.now() - 24 * 60 * 60 * 1_000).toISOString(),
          validTo: new Date(Date.now() + 24 * 60 * 60 * 1_000).toISOString(),
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadConsolidatedClaimableRoleAssignments,
      activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
      deactivateClaimableRoleAssignment: mocks.deactivateClaimableRoleAssignment,
      isActivating: false,
      activationError: undefined,
      isDeactivating: false,
      deactivationError: undefined,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows role information without expanding the flyout row', async () => {
    const screen = await render(<RolesView compact />);

    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await screen.getByRole('button', { name: 'Show information about Reports exporter' }).click();

    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.element(screen.getByText('Exports reports.')).toBeVisible();
    await expect.element(screen.getByText('Assigned through the Reports team')).toBeVisible();
    await expect.element(screen.getByText('project: Reports portfolio')).toBeVisible();
    await expect.element(screen.getByText('Available to activate')).toBeVisible();
  });

  it('claims an assignment through the activation switch', async () => {
    const screen = await render(<RolesView compact />);

    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await screen.getByLabelText('Activate Reports exporter').click();
    await screen.getByLabelText('Reason').fill('Required to export reports');
    await screen.getByRole('button', { name: 'Claim', exact: true }).click();

    await vi.waitFor(() =>
      expect(mocks.activateClaimableRoleAssignment).toHaveBeenCalledWith({
        assignmentId: 'claimable-role',
        reason: 'Required to export reports',
        hours: 2,
      }),
    );
  });

  it('offers recently expired roles for reactivation on a separate tab', async () => {
    const screen = await render(<RolesView compact />);

    await screen.getByRole('tab', { name: 'Expired' }).click();

    const expiredPanel = screen.getByRole('tabpanel', { name: 'Expired' });
    await expect.element(expiredPanel.getByText('Recent developer')).toBeVisible();
    await screen.getByLabelText('Re-activate Recent developer').click();
    await expect.element(screen.getByText('Claim Recent developer', { exact: true })).toBeVisible();
  });

  it('keeps expired assignments beyond the three newest shortcuts claimable', async () => {
    const now = Date.now();
    // Deliberately unsorted history verifies that the shortcut limit follows expiry, not API order.
    const roles = [4, 1, 3, 2].map((age) => ({
      id: `expired-${age}`,
      claimableRole: { name: `expired-${age}`, displayName: `Expired role ${age}` },
      isActive: false,
      activeTo: new Date(now - age * 60_000).toISOString(),
      validTo: new Date(now + 60_000).toISOString(),
    }));
    mocks.useClaimableRoleAssignments.mockReturnValue({
      ...mocks.useClaimableRoleAssignments(),
      assignments: roles,
    });
    const screen = await render(<RolesView compact />);

    const claimablePanel = screen.getByRole('tabpanel', { name: 'Claimable' });
    await expect.element(claimablePanel.getByText('Expired role 4', { exact: true })).toBeVisible();
    await expect
      .element(claimablePanel.getByText('Expired role 1', { exact: true }))
      .not.toBeInTheDocument();
    await claimablePanel.getByLabelText('Activate Expired role 4').click();
    await screen.getByLabelText('Reason').fill('Continue reporting');
    await screen.getByRole('dialog').getByRole('button', { name: 'Claim', exact: true }).click();
    expect(mocks.activateClaimableRoleAssignment).toHaveBeenCalledWith({
      assignmentId: 'expired-4',
      reason: 'Continue reporting',
      hours: 2,
    });

    await screen.getByRole('tab', { name: 'Expired' }).click();
    const expiredPanel = screen.getByRole('tabpanel', { name: 'Expired' });
    // The other three assignments remain reachable through the existing shortcut controls.
    for (const age of [1, 2, 3]) {
      await expect
        .element(expiredPanel.getByLabelText(`Re-activate Expired role ${age}`))
        .toBeVisible();
    }
    await expect
      .element(expiredPanel.getByText('Expired role 4', { exact: true }))
      .not.toBeInTheDocument();
  });

  it('shows claimed role details and deactivates it from the active tab', async () => {
    mocks.useActiveAccessRoleAssignments.mockReturnValue({
      assignments: [
        {
          systemName: 'Fusion Apps',
          accessRoleName: 'Fusion.Apps.FullControl',
          assignmentType: 'Direct',
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadActiveAccessRoleAssignments,
    });
    mocks.useClaimableRoleAssignments.mockReturnValue({
      ...mocks.useClaimableRoleAssignments(),
      assignments: [
        {
          id: 'claimed-role',
          claimableRole: {
            name: 'reports-exporter',
            displayName: 'Reports exporter',
            description: 'Exports reports.',
          },
          reasons: ['Assigned through the Reports team'],
          isActive: true,
          activeTo: '2026-09-05T16:00:00Z',
        },
      ],
    });
    const screen = await render(<RolesView compact />);

    await screen.getByRole('tab', { name: 'Active' }).click();
    const activePanel = screen.getByRole('tabpanel', { name: 'Active' });
    await expect.element(screen.getByText(/Claimed · Expires/)).toBeVisible();
    await expect.element(screen.getByText('Active access')).toBeVisible();
    await expect
      .element(activePanel.getByLabelText('Deactivate Reports exporter'))
      .not.toBeInTheDocument();
    await screen.getByRole('button', { name: 'Show information about Reports exporter' }).click();
    await expect.element(screen.getByText('Assigned through the Reports team')).toBeVisible();
    await screen.getByRole('button', { name: 'Close' }).click();
    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await screen.getByLabelText('Deactivate Reports exporter').click();

    expect(mocks.deactivateClaimableRoleAssignment).toHaveBeenCalledWith({
      assignmentId: 'claimed-role',
    });
  });

  it('shows an assigned role in the active tab without a deactivate control', async () => {
    const validTo = new Date(Date.now() + 365 * 24 * 60 * 60 * 1_000).toISOString();
    mocks.useRoleAssignments.mockReturnValue({
      assignments: [
        {
          id: 'assigned-assignment',
          role: {
            name: 'reports-admin',
            displayName: 'Reports admin',
            description: 'Administers reporting infrastructure.',
          },
          reasons: ['Granted through the Reports team charter'],
          validTo,
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadConsolidatedRoleAssignments,
    });
    const screen = await render(<RolesView compact />);

    await screen.getByRole('tab', { name: 'Active' }).click();
    const activePanel = screen.getByRole('tabpanel', { name: 'Active' });
    await expect
      .element(activePanel.getByRole('heading', { name: 'Assigned roles' }))
      .toBeVisible();
    await expect.element(activePanel.getByText('Reports admin')).toBeVisible();
    await expect.element(screen.getByText(/Role assignment · Valid until/)).toBeVisible();
    await expect
      .element(activePanel.getByLabelText('Deactivate Reports admin'))
      .not.toBeInTheDocument();
    await screen.getByRole('button', { name: 'Show information about Reports admin' }).click();
    await expect
      .element(screen.getByText('Granted through the Reports team charter'))
      .toBeVisible();
  });
});

import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RolesView } from '../RolesView';

const mocks = vi.hoisted(() => ({
  reloadActive: vi.fn(),
  reloadClaimable: vi.fn(),
  claimRole: vi.fn(),
  deactivateRole: vi.fn(),
  useRoles: vi.fn(),
  useClaimableRoles: vi.fn(),
}));

vi.mock('../../hooks/useRoles', () => ({
  useRoles: mocks.useRoles,
}));

vi.mock('../../hooks/useClaimableRoles', () => ({
  useClaimableRoles: mocks.useClaimableRoles,
}));

describe('CompactRolesView', () => {
  beforeEach(() => {
    mocks.reloadActive.mockReset();
    mocks.reloadClaimable.mockReset();
    mocks.claimRole.mockReset();
    mocks.deactivateRole.mockReset();
    mocks.useRoles.mockReset();
    mocks.useClaimableRoles.mockReset();
    mocks.reloadActive.mockResolvedValue(undefined);
    mocks.reloadClaimable.mockResolvedValue(undefined);
    mocks.claimRole.mockResolvedValue({ activeToDate: '2026-09-05T16:00:00Z' });
    mocks.deactivateRole.mockResolvedValue({ activeToDate: '2026-09-05T13:00:00Z' });
    mocks.useRoles.mockReturnValue({
      roles: [],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadActive,
    });
    mocks.useClaimableRoles.mockReturnValue({
      roles: [
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
      reload: mocks.reloadClaimable,
      claimRole: mocks.claimRole,
      deactivateRole: mocks.deactivateRole,
      isClaiming: false,
      claimError: undefined,
      isDeactivating: false,
      deactivateError: undefined,
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
      expect(mocks.claimRole).toHaveBeenCalledWith({
        roleId: 'claimable-role',
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
    mocks.useClaimableRoles.mockReturnValue({ ...mocks.useClaimableRoles(), roles });
    const screen = await render(<RolesView compact />);

    const claimablePanel = screen.getByRole('tabpanel', { name: 'Claimable' });
    await expect.element(claimablePanel.getByText('Expired role 4', { exact: true })).toBeVisible();
    await expect
      .element(claimablePanel.getByText('Expired role 1', { exact: true }))
      .not.toBeInTheDocument();
    await claimablePanel.getByLabelText('Activate Expired role 4').click();
    await screen.getByLabelText('Reason').fill('Continue reporting');
    await screen.getByRole('dialog').getByRole('button', { name: 'Claim', exact: true }).click();
    expect(mocks.claimRole).toHaveBeenCalledWith({
      roleId: 'expired-4',
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
    mocks.useRoles.mockReturnValue({
      roles: [
        {
          systemName: 'Fusion Apps',
          accessRoleName: 'Fusion.Apps.FullControl',
          assignmentType: 'Direct',
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadActive,
    });
    mocks.useClaimableRoles.mockReturnValue({
      ...mocks.useClaimableRoles(),
      roles: [
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
    await expect.element(screen.getByText('Permanent')).toBeVisible();
    await expect
      .element(activePanel.getByLabelText('Deactivate Reports exporter'))
      .not.toBeInTheDocument();
    await screen.getByRole('button', { name: 'Show information about Reports exporter' }).click();
    await expect.element(screen.getByText('Assigned through the Reports team')).toBeVisible();
    await screen.getByRole('button', { name: 'Close' }).click();
    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await screen.getByLabelText('Deactivate Reports exporter').click();

    expect(mocks.deactivateRole).toHaveBeenCalledWith({ roleId: 'claimed-role' });
  });
});

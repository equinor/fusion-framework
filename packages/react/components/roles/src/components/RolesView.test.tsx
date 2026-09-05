import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RolesView } from './RolesView';

const mocks = vi.hoisted(() => ({
  reloadActive: vi.fn(),
  reloadClaimable: vi.fn(),
  claimRole: vi.fn(),
  useRoles: vi.fn(),
  useClaimableRoles: vi.fn(),
}));

vi.mock('../hooks/useRoles', () => ({
  useRoles: mocks.useRoles,
}));

vi.mock('../hooks/useClaimableRoles', () => ({
  useClaimableRoles: mocks.useClaimableRoles,
}));

describe('RolesView', () => {
  beforeEach(() => {
    mocks.reloadActive.mockReset();
    mocks.reloadClaimable.mockReset();
    mocks.claimRole.mockReset();
    mocks.useRoles.mockReset();
    mocks.useClaimableRoles.mockReset();
    mocks.reloadActive.mockResolvedValue(undefined);
    mocks.reloadClaimable.mockResolvedValue(undefined);
    mocks.claimRole.mockResolvedValue({ activeToDate: '2026-09-05T16:00:00Z' });
    mocks.useRoles.mockReturnValue({
      roles: [
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Permanent',
          activeToDate: null,
        },
      ],
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
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadClaimable,
      claimRole: mocks.claimRole,
      isClaiming: false,
      claimError: undefined,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows active and claimable assignments from the shared hooks', async () => {
    const screen = await render(<RolesView />);

    await expect.element(screen.getByText('Reports.Read')).toBeVisible();
    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await expect.element(screen.getByText('Reports exporter')).toBeVisible();
  });

  it('claims an assignment through the Roles provider action', async () => {
    const screen = await render(<RolesView />);

    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await screen.getByRole('button', { name: 'Claim' }).click();
    await screen.getByLabelText('Reason').fill('Required to export reports');
    await screen.getByRole('button', { name: 'Claim', exact: true }).last().click();

    await vi.waitFor(() =>
      expect(mocks.claimRole).toHaveBeenCalledWith({
        roleId: 'claimable-role',
        reason: 'Required to export reports',
        hours: 2,
      }),
    );
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'waits for both collections before rendering (compact=%s)',
    async (compact) => {
      mocks.useRoles.mockReturnValue({
        roles: [],
        isLoading: true,
        error: undefined,
        reload: mocks.reloadActive,
      });
      const screen = await render(<RolesView compact={compact} />);
      await expect.element(screen.getByLabelText('Loading roles')).toBeVisible();
      await expect.element(screen.getByRole('tab', { name: 'Claimable' })).not.toBeInTheDocument();
    },
  );

  it.each([false, true])(
    'retries both collections after a load failure (compact=%s)',
    async (compact) => {
      mocks.useRoles.mockReturnValue({
        roles: [],
        isLoading: false,
        error: new Error('Active roles unavailable'),
        reload: mocks.reloadActive,
      });
      const screen = await render(<RolesView compact={compact} />);
      await expect.element(screen.getByText('Error: Active roles unavailable')).toBeVisible();
      await screen.getByRole('button', { name: 'Retry' }).click();
      expect(mocks.reloadActive).toHaveBeenCalledOnce();
      expect(mocks.reloadClaimable).toHaveBeenCalledOnce();
    },
  );

  it.each([false, true])(
    'shows empty tabs when no assignments exist (compact=%s)',
    async (compact) => {
      mocks.useRoles.mockReturnValue({
        roles: [],
        isLoading: false,
        reload: mocks.reloadActive,
      });
      mocks.useClaimableRoles.mockReturnValue({
        roles: [],
        isLoading: false,
        reload: mocks.reloadClaimable,
      });
      const screen = await render(<RolesView compact={compact} />);
      await screen.getByRole('tab', { name: 'Active', exact: true }).click();
      await expect.element(screen.getByText('You have no active roles')).toBeVisible();
      await screen.getByRole('tab', { name: 'Claimable' }).click();
      await expect.element(screen.getByText('You have no available roles')).toBeVisible();
    },
  );
});

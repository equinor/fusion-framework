import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RolesView } from './RolesView';

const mocks = vi.hoisted(() => ({
  reloadActiveAccessRoleAssignments: vi.fn(),
  reloadConsolidatedClaimableRoleAssignments: vi.fn(),
  reloadConsolidatedRoleAssignments: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
  useActiveAccessRoleAssignments: vi.fn(),
  useClaimableRoleAssignments: vi.fn(),
  useRoleAssignments: vi.fn(),
}));

vi.mock('../hooks/useActiveAccessRoleAssignments', () => ({
  useActiveAccessRoleAssignments: mocks.useActiveAccessRoleAssignments,
}));

vi.mock('../hooks/useClaimableRoleAssignments', () => ({
  useClaimableRoleAssignments: mocks.useClaimableRoleAssignments,
}));

vi.mock('../hooks/useRoleAssignments', () => ({
  useRoleAssignments: mocks.useRoleAssignments,
}));

describe('RolesView', () => {
  beforeEach(() => {
    mocks.reloadActiveAccessRoleAssignments.mockReset();
    mocks.reloadConsolidatedClaimableRoleAssignments.mockReset();
    mocks.reloadConsolidatedRoleAssignments.mockReset();
    mocks.activateClaimableRoleAssignment.mockReset();
    mocks.useActiveAccessRoleAssignments.mockReset();
    mocks.useClaimableRoleAssignments.mockReset();
    mocks.useRoleAssignments.mockReset();
    mocks.reloadActiveAccessRoleAssignments.mockResolvedValue(undefined);
    mocks.reloadConsolidatedClaimableRoleAssignments.mockResolvedValue(undefined);
    mocks.reloadConsolidatedRoleAssignments.mockResolvedValue(undefined);
    mocks.activateClaimableRoleAssignment.mockResolvedValue({
      activeToDate: '2026-09-05T16:00:00Z',
    });
    mocks.useRoleAssignments.mockReturnValue({
      assignments: [],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadConsolidatedRoleAssignments,
    });
    mocks.useActiveAccessRoleAssignments.mockReturnValue({
      assignments: [
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Permanent',
          activeToDate: null,
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadActiveAccessRoleAssignments,
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
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadConsolidatedClaimableRoleAssignments,
      activateClaimableRoleAssignment: mocks.activateClaimableRoleAssignment,
      isActivating: false,
      activationError: undefined,
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

  it('labels assigned roles separately from effective active access', async () => {
    mocks.useRoleAssignments.mockReturnValue({
      assignments: [
        {
          id: 'assigned-role',
          role: {
            name: 'reports-admin',
            displayName: 'Reports admin',
            description: 'Administers reports.',
          },
        },
      ],
      isLoading: false,
      error: undefined,
      reload: mocks.reloadConsolidatedRoleAssignments,
    });

    const screen = await render(<RolesView />);

    await expect.element(screen.getByRole('heading', { name: 'Assigned roles' })).toBeVisible();
    await expect.element(screen.getByText('Reports admin')).toBeVisible();
    await expect.element(screen.getByRole('heading', { name: 'Effective access' })).toBeVisible();
    await expect.element(screen.getByText('Reports.Read')).toBeVisible();
  });

  it('reconciles scoped active cards without duplicate keys or replacing surviving cards', async () => {
    const consoleError = vi.spyOn(console, 'error');
    const role = { systemName: 'Reports', accessRoleName: 'Reports.Read' };
    const first = { ...role, scope: { type: 'project', isGlobal: false, values: ['A'] } };
    const second = { ...role, scope: { type: 'project', isGlobal: false, values: ['B'] } };
    const state = {
      ...mocks.useActiveAccessRoleAssignments(),
      assignments: [first, second, first],
    };
    mocks.useActiveAccessRoleAssignments.mockReturnValue(state);
    try {
      const screen = await render(<RolesView />);
      const cards = screen.getByText('Reports.Read').elements();
      expect(cards).toHaveLength(3);
      mocks.useActiveAccessRoleAssignments.mockReturnValue({ ...state, assignments: [second] });
      await screen.rerender(<RolesView />);
      expect(screen.getByText('Reports.Read').elements()).toEqual([cards[1]]);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('claims an assignment through the Roles provider action', async () => {
    const screen = await render(<RolesView />);

    await screen.getByRole('tab', { name: 'Claimable' }).click();
    await screen.getByRole('button', { name: 'Claim' }).click();
    await screen.getByLabelText('Reason').fill('Required to export reports');
    await screen.getByRole('button', { name: 'Claim', exact: true }).last().click();

    await vi.waitFor(() =>
      expect(mocks.activateClaimableRoleAssignment).toHaveBeenCalledWith({
        assignmentId: 'claimable-role',
        reason: 'Required to export reports',
        hours: 2,
      }),
    );
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'waits for both collections before rendering (compact=%s)',
    async (compact) => {
      mocks.useActiveAccessRoleAssignments.mockReturnValue({
        assignments: [],
        isLoading: true,
        error: undefined,
        reload: mocks.reloadActiveAccessRoleAssignments,
      });
      const screen = await render(<RolesView compact={compact} />);
      await expect.element(screen.getByLabelText('Loading role assignments')).toBeVisible();
      await expect.element(screen.getByRole('tab', { name: 'Claimable' })).not.toBeInTheDocument();
    },
  );

  it.each([false, true])(
    'retries both collections after a load failure (compact=%s)',
    async (compact) => {
      mocks.useActiveAccessRoleAssignments.mockReturnValue({
        assignments: [],
        isLoading: false,
        error: new Error('Active roles unavailable'),
        reload: mocks.reloadActiveAccessRoleAssignments,
      });
      const screen = await render(<RolesView compact={compact} />);
      await expect.element(screen.getByText('Error: Active roles unavailable')).toBeVisible();
      await screen.getByRole('button', { name: 'Retry' }).click();
      expect(mocks.reloadActiveAccessRoleAssignments).toHaveBeenCalledOnce();
      expect(mocks.reloadConsolidatedClaimableRoleAssignments).toHaveBeenCalledOnce();
    },
  );

  it.each([false, true])(
    'shows empty tabs when no assignments exist (compact=%s)',
    async (compact) => {
      mocks.useActiveAccessRoleAssignments.mockReturnValue({
        assignments: [],
        isLoading: false,
        reload: mocks.reloadActiveAccessRoleAssignments,
      });
      mocks.useClaimableRoleAssignments.mockReturnValue({
        assignments: [],
        isLoading: false,
        reload: mocks.reloadConsolidatedClaimableRoleAssignments,
      });
      const screen = await render(<RolesView compact={compact} />);
      await screen.getByRole('tab', { name: 'Active', exact: true }).click();
      await expect
        .element(
          screen.getByText(
            compact
              ? 'You have no assigned, claimed, or effective access'
              : 'You have no assigned roles or effective access',
          ),
        )
        .toBeVisible();
      await screen.getByRole('tab', { name: 'Claimable' }).click();
      await expect.element(screen.getByText('You have no roles to claim')).toBeVisible();
    },
  );
});

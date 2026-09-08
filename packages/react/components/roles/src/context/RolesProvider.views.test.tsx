import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesProvider } from './RolesProvider';
import { RolesView } from '../components/RolesView';
import type {
  ActiveAccessRoleAssignments,
  ConsolidatedClaimableRoleAssignments,
} from '../state/roles-state';

const provider = vi.hoisted(() => ({
  getActiveAccessRoleAssignments: vi.fn(),
  getConsolidatedClaimableRoleAssignments: vi.fn(),
  getConsolidatedRoleAssignments: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
  deactivateClaimableRoleAssignment: vi.fn(),
  hasAccessRole: vi.fn(),
}));

vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModule: () => provider,
}));

const assignments: ConsolidatedClaimableRoleAssignments = [
  {
    id: 'reports-assignment',
    claimableRole: { name: 'reports-exporter', displayName: 'Reports exporter' },
    isActive: false,
  },
];

describe('RolesProvider with real role views', () => {
  beforeEach(() => {
    provider.getActiveAccessRoleAssignments.mockReset().mockResolvedValue([]);
    provider.getConsolidatedClaimableRoleAssignments.mockReset().mockResolvedValue(assignments);
    provider.getConsolidatedRoleAssignments.mockReset().mockResolvedValue([]);
    provider.activateClaimableRoleAssignment.mockReset().mockResolvedValue({ id: 'activation' });
    provider.deactivateClaimableRoleAssignment
      .mockReset()
      .mockResolvedValue({ id: 'deactivation' });
    provider.hasAccessRole.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it.each([true, false])(
    'keeps audit inputs and mutation errors through focus and interval refresh (compact=%s)',
    async (compact) => {
      const interval = vi.spyOn(window, 'setInterval');
      const screen = await render(
        <RolesProvider>
          <RolesView compact={compact} />
        </RolesProvider>,
      );
      await screen.getByRole('tab', { name: 'Claimable' }).click();
      // Exercise each layout's real entry point into the shared audit dialog.
      if (compact) {
        await screen.getByLabelText('Activate Reports exporter').click();
      } else {
        await screen.getByRole('button', { name: 'Claim', exact: true }).click();
      }
      const dialog = screen.getByRole('dialog');
      await dialog.getByLabelText('Reason').fill('Keep this audit reason');
      await dialog.getByRole('slider').fill('5');

      const activeRead = Promise.withResolvers<ActiveAccessRoleAssignments>();
      const claimableRead = Promise.withResolvers<ConsolidatedClaimableRoleAssignments>();
      provider.getActiveAccessRoleAssignments.mockReturnValueOnce(activeRead.promise);
      provider.getConsolidatedClaimableRoleAssignments.mockReturnValueOnce(claimableRead.promise);
      window.dispatchEvent(new Event('focus'));
      await expect.element(screen.getByText(/Refreshing role data…/)).toBeVisible();
      await expect.element(dialog.getByLabelText('Reason')).toHaveValue('Keep this audit reason');
      await expect.element(dialog.getByText('Duration: 5 hours')).toBeVisible();
      activeRead.reject(new Error('Active collection unavailable'));
      claimableRead.resolve(assignments);
      await expect
        .element(screen.getByText(/Some role data could not be loaded/))
        .toHaveTextContent('Active collection unavailable');
      await expect.element(dialog).toBeVisible();

      provider.activateClaimableRoleAssignment.mockRejectedValueOnce(
        new Error('Activation rejected'),
      );
      await dialog.getByRole('button', { name: 'Claim', exact: true }).click();
      await expect.element(dialog.getByRole('alert')).toBeVisible();
      // Fire the actual registered polling callback without advancing unrelated EDS timers.
      const refreshInterval = interval.mock.calls.find(([, delay]) => delay === 60_000)?.[0];
      expect(refreshInterval).toBeTypeOf('function');
      const intervalRead = Promise.withResolvers<ConsolidatedClaimableRoleAssignments>();
      provider.getConsolidatedClaimableRoleAssignments.mockReturnValueOnce(intervalRead.promise);
      // Guard the browser's string-handler overload before invoking the actual polling callback.
      if (typeof refreshInterval === 'function') {
        refreshInterval();
      }
      await expect.element(screen.getByText(/Refreshing role data…/)).toBeVisible();
      await expect.element(dialog.getByRole('alert')).toBeVisible();
      await expect.element(dialog.getByLabelText('Reason')).toHaveValue('Keep this audit reason');
      intervalRead.resolve(assignments);
      await expect.element(screen.getByText(/Refreshing role data…/)).not.toBeInTheDocument();
      await expect.element(dialog.getByText('Duration: 5 hours')).toBeVisible();

      // A successful retry closes the form even if its follow-up collection refresh fails.
      provider.getActiveAccessRoleAssignments.mockRejectedValueOnce(
        new Error('Refresh unavailable'),
      );
      await dialog.getByRole('button', { name: 'Claim', exact: true }).click();
      await expect.element(dialog).not.toBeInTheDocument();
      await expect
        .element(screen.getByText(/Some role data could not be loaded/))
        .toHaveTextContent('Refresh unavailable');
      expect(provider.activateClaimableRoleAssignment).toHaveBeenCalledTimes(2);
      expect(provider.activateClaimableRoleAssignment).toHaveBeenLastCalledWith({
        assignmentId: 'reports-assignment',
        reason: 'Keep this audit reason',
        hours: 5,
      });
    },
  );

  it('retains the compact information dialog while refreshing', async () => {
    const screen = await render(
      <RolesProvider>
        <RolesView compact />
      </RolesProvider>,
    );
    await screen.getByRole('button', { name: 'Show information about Reports exporter' }).click();
    const refresh = Promise.withResolvers<ConsolidatedClaimableRoleAssignments>();
    provider.getConsolidatedClaimableRoleAssignments.mockReturnValueOnce(refresh.promise);
    window.dispatchEvent(new Event('focus'));
    await expect.element(screen.getByRole('status')).toBeVisible();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    refresh.resolve(assignments);
    await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('owns deactivation rejection at the switch and displays the hook error for retry', async () => {
    provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue([
      { ...assignments[0], isActive: true },
    ]);
    provider.deactivateClaimableRoleAssignment.mockRejectedValueOnce(
      new Error('Cannot deactivate right now'),
    );
    const screen = await render(
      <RolesProvider>
        <RolesView compact />
      </RolesProvider>,
    );
    await screen.getByLabelText('Deactivate Reports exporter').click();
    await expect.element(screen.getByText('Error: Cannot deactivate right now')).toBeVisible();
    await expect.element(screen.getByLabelText('Deactivate Reports exporter')).toBeChecked();
    provider.getConsolidatedClaimableRoleAssignments.mockResolvedValue(assignments);
    await screen.getByLabelText('Deactivate Reports exporter').click();
    await expect.element(screen.getByLabelText('Activate Reports exporter')).not.toBeChecked();
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    expect(provider.deactivateClaimableRoleAssignment).toHaveBeenCalledTimes(2);
  });
});

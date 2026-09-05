import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RolesProvider } from './RolesProvider';
import { RolesView } from '../components/RolesView';
import type { ActiveRoles, ClaimableRoles } from '../state/roles-state';

const provider = vi.hoisted(() => ({
  getActiveRoles: vi.fn(),
  getClaimableRoles: vi.fn(),
  claimRole: vi.fn(),
  deactivateRole: vi.fn(),
  hasRole: vi.fn(),
}));

vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModule: () => provider,
}));

const assignments: ClaimableRoles = [
  {
    id: 'reports-assignment',
    claimableRole: { name: 'reports-exporter', displayName: 'Reports exporter' },
    isActive: false,
  },
];

describe('RolesProvider with real role views', () => {
  beforeEach(() => {
    provider.getActiveRoles.mockReset().mockResolvedValue([]);
    provider.getClaimableRoles.mockReset().mockResolvedValue(assignments);
    provider.claimRole.mockReset().mockResolvedValue({ id: 'activation' });
    provider.deactivateRole.mockReset().mockResolvedValue({ id: 'deactivation' });
    provider.hasRole.mockReset().mockResolvedValue(true);
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

      const activeRead = Promise.withResolvers<ActiveRoles>();
      const claimableRead = Promise.withResolvers<ClaimableRoles>();
      provider.getActiveRoles.mockReturnValueOnce(activeRead.promise);
      provider.getClaimableRoles.mockReturnValueOnce(claimableRead.promise);
      window.dispatchEvent(new Event('focus'));
      await expect.element(screen.getByText(/Refreshing roles…/)).toBeVisible();
      await expect.element(dialog.getByLabelText('Reason')).toHaveValue('Keep this audit reason');
      await expect.element(dialog.getByText('Duration: 5 hours')).toBeVisible();
      activeRead.reject(new Error('Active collection unavailable'));
      claimableRead.resolve(assignments);
      await expect
        .element(screen.getByText(/Some roles could not be loaded/))
        .toHaveTextContent('Active collection unavailable');
      await expect.element(dialog).toBeVisible();

      provider.claimRole.mockRejectedValueOnce(new Error('Activation rejected'));
      await dialog.getByRole('button', { name: 'Claim', exact: true }).click();
      await expect.element(dialog.getByRole('alert')).toBeVisible();
      // Fire the actual registered polling callback without advancing unrelated EDS timers.
      const refreshInterval = interval.mock.calls.find(([, delay]) => delay === 60_000)?.[0];
      expect(refreshInterval).toBeTypeOf('function');
      const intervalRead = Promise.withResolvers<ClaimableRoles>();
      provider.getClaimableRoles.mockReturnValueOnce(intervalRead.promise);
      // Guard the browser's string-handler overload before invoking the actual polling callback.
      if (typeof refreshInterval === 'function') {
        refreshInterval();
      }
      await expect.element(screen.getByText(/Refreshing roles…/)).toBeVisible();
      await expect.element(dialog.getByRole('alert')).toBeVisible();
      await expect.element(dialog.getByLabelText('Reason')).toHaveValue('Keep this audit reason');
      intervalRead.resolve(assignments);
      await expect.element(screen.getByText(/Refreshing roles…/)).not.toBeInTheDocument();
      await expect.element(dialog.getByText('Duration: 5 hours')).toBeVisible();

      // A successful retry closes the form even if its follow-up collection refresh fails.
      provider.getActiveRoles.mockRejectedValueOnce(new Error('Refresh unavailable'));
      await dialog.getByRole('button', { name: 'Claim', exact: true }).click();
      await expect.element(dialog).not.toBeInTheDocument();
      await expect
        .element(screen.getByText(/Some roles could not be loaded/))
        .toHaveTextContent('Refresh unavailable');
      expect(provider.claimRole).toHaveBeenCalledTimes(2);
      expect(provider.claimRole).toHaveBeenLastCalledWith({
        roleId: 'reports-assignment',
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
    const refresh = Promise.withResolvers<ClaimableRoles>();
    provider.getClaimableRoles.mockReturnValueOnce(refresh.promise);
    window.dispatchEvent(new Event('focus'));
    await expect.element(screen.getByRole('status')).toBeVisible();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    refresh.resolve(assignments);
    await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
  });

  it('owns deactivation rejection at the switch and displays the hook error for retry', async () => {
    provider.getClaimableRoles.mockResolvedValue([{ ...assignments[0], isActive: true }]);
    provider.deactivateRole.mockRejectedValueOnce(new Error('Cannot deactivate right now'));
    const screen = await render(
      <RolesProvider>
        <RolesView compact />
      </RolesProvider>,
    );
    await screen.getByLabelText('Deactivate Reports exporter').click();
    await expect.element(screen.getByText('Error: Cannot deactivate right now')).toBeVisible();
    await expect.element(screen.getByLabelText('Deactivate Reports exporter')).toBeChecked();
    provider.getClaimableRoles.mockResolvedValue(assignments);
    await screen.getByLabelText('Deactivate Reports exporter').click();
    await expect.element(screen.getByLabelText('Activate Reports exporter')).not.toBeChecked();
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    expect(provider.deactivateRole).toHaveBeenCalledTimes(2);
  });
});

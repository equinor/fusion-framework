import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, type ReactNode } from 'react';

import { RolesProvider } from './RolesProvider';
import { useClaimableRoles } from '../hooks/useClaimableRoles';
import { useRoles } from '../hooks/useRoles';

const mocks = vi.hoisted(() => ({
  getActiveRoles: vi.fn(),
  getClaimableRoles: vi.fn(),
  claimRole: vi.fn(),
  deactivateRole: vi.fn(),
  hasRole: vi.fn(),
}));

vi.mock('@equinor/fusion-framework-react-module', () => ({
  useModule: () => mocks,
}));

/**
 * Renders both role domains and exposes the claim action for provider tests.
 *
 * @returns A minimal consumer of the public roles hooks.
 */
const RolesConsumer = (): ReactNode => {
  const active = useRoles();
  const claimable = useClaimableRoles();
  const error =
    active.error ?? claimable.error ?? claimable.claimError ?? claimable.deactivateError;

  // Both domain requests must settle before assertions inspect their results.
  if (active.isLoading || claimable.isLoading) {
    return <p>Loading roles</p>;
  }
  // Provider errors remain visible through the hook state.
  if (error) {
    return <p role="alert">{String(error)}</p>;
  }
  // Flatten active-role names into the compact assertion output.
  const activeRoleNames = active.roles.map((role) => role.accessRoleName).join(', ');
  // Flatten claimable-role names into the compact assertion output.
  const claimableRoleNames = claimable.roles.map((role) => role.claimableRole?.name).join(', ');
  return (
    <>
      <p>Active: {activeRoleNames}</p>
      <p>Claimable: {claimableRoleNames}</p>
      <button
        type="button"
        onClick={() =>
          void claimable.claimRole({ roleId: 'claimable-role' }).catch(() => undefined)
        }
      >
        Claim
      </button>
      <button
        type="button"
        onClick={() =>
          void claimable.deactivateRole({ roleId: 'claimable-role' }).catch(() => undefined)
        }
      >
        Deactivate
      </button>
    </>
  );
};

describe('RolesProvider', () => {
  beforeEach(() => {
    mocks.getActiveRoles.mockReset();
    mocks.getClaimableRoles.mockReset();
    mocks.claimRole.mockReset();
    mocks.deactivateRole.mockReset();
    mocks.hasRole.mockReset();
    mocks.getActiveRoles.mockResolvedValue([]);
    mocks.getClaimableRoles.mockResolvedValue([]);
    mocks.claimRole.mockResolvedValue({ id: 'activation-id' });
    mocks.deactivateRole.mockResolvedValue({ id: 'deactivation-id' });
    mocks.hasRole.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('shares both role domains and refreshes them after activation', async () => {
    mocks.getActiveRoles
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ accessRoleName: 'Reports.Read' }]);
    mocks.getClaimableRoles
      .mockResolvedValueOnce([{ id: 'claimable-role', claimableRole: { name: 'reports-reader' } }])
      .mockResolvedValue([]);

    const screen = await render(
      <RolesProvider>
        <RolesConsumer />
      </RolesProvider>,
    );

    await expect.element(screen.getByText('Claimable: reports-reader')).toBeVisible();
    await screen.getByRole('button', { name: 'Claim' }).click();
    await expect.element(screen.getByText('Active: Reports.Read')).toBeVisible();
    await expect.element(screen.getByText('Claimable:', { exact: true })).toBeVisible();
    expect(mocks.getActiveRoles).toHaveBeenCalledTimes(2);
    expect(mocks.getClaimableRoles).toHaveBeenCalledTimes(2);
  });

  it('exposes collection failures through the matching domain hook', async () => {
    mocks.getActiveRoles.mockRejectedValue(new Error('active roles failed'));

    const screen = await render(
      <RolesProvider>
        <RolesConsumer />
      </RolesProvider>,
    );

    await expect.element(screen.getByRole('alert')).toHaveTextContent('active roles failed');
  });

  it('refreshes both role domains after deactivation', async () => {
    const screen = await render(
      <RolesProvider>
        <RolesConsumer />
      </RolesProvider>,
    );
    await expect.element(screen.getByRole('button', { name: 'Deactivate' })).toBeVisible();

    await screen.getByRole('button', { name: 'Deactivate' }).click();

    await vi.waitFor(() =>
      expect(mocks.deactivateRole).toHaveBeenCalledWith({ roleId: 'claimable-role' }),
    );
    expect(mocks.getActiveRoles).toHaveBeenCalledTimes(2);
    expect(mocks.getClaimableRoles).toHaveBeenCalledTimes(2);
  });

  it('gates children by the required roles', async () => {
    const screen = await render(
      <RolesProvider required={['Reports.Read']}>
        <RolesConsumer />
      </RolesProvider>,
    );

    await expect.element(screen.getByText('Active:', { exact: true })).toBeVisible();
    expect(mocks.hasRole).toHaveBeenCalledWith(['Reports.Read'], {
      required: true,
      assert: true,
    });
  });

  it('exposes activation failures through claimable-role state', async () => {
    mocks.claimRole.mockRejectedValue(new Error('activation failed'));
    const screen = await render(
      <RolesProvider>
        <RolesConsumer />
      </RolesProvider>,
    );

    await expect.element(screen.getByRole('button', { name: 'Claim' })).toBeVisible();
    await screen.getByRole('button', { name: 'Claim' }).click();
    await expect.element(screen.getByRole('alert')).toHaveTextContent('activation failed');
  });

  it('refreshes visible role state when the window regains focus', async () => {
    const screen = await render(
      <RolesProvider>
        <RolesConsumer />
      </RolesProvider>,
    );
    await expect.element(screen.getByText('Active:', { exact: true })).toBeVisible();

    window.dispatchEvent(new Event('focus'));

    await vi.waitFor(() => expect(mocks.getActiveRoles).toHaveBeenCalledTimes(2));
    expect(mocks.getActiveRoles).toHaveBeenLastCalledWith({ refresh: true });
    expect(mocks.getClaimableRoles).toHaveBeenLastCalledWith({ refresh: true });
  });

  it('retains expiry recovery after failed activation and closes only after a successful retry', async () => {
    const first = Promise.withResolvers<void>();
    const retry = Promise.withResolvers<{ id: string }>();
    mocks.claimRole.mockReturnValueOnce(first.promise).mockReturnValueOnce(retry.promise);
    const onMount = vi.fn();
    /** Keeps host state observable while the provider handles expiry recovery. */
    const Application = (): ReactNode => {
      useEffect(onMount, []);
      return <input aria-label="Unsaved report" defaultValue="Draft report" />;
    };
    const activeAssignment = {
      id: 'expiring-role',
      claimableRole: {
        name: 'reports-exporter',
        displayName: 'Reports exporter',
        description: 'Exports reports.',
      },
      isActive: true,
      activeTo: new Date(Date.now() + 60_000).toISOString(),
    };
    mocks.getClaimableRoles.mockResolvedValueOnce([activeAssignment]).mockResolvedValue([
      {
        ...activeAssignment,
        isActive: false,
        activeTo: new Date(Date.now() - 1_000).toISOString(),
      },
    ]);
    const screen = await render(
      <RolesProvider>
        <RolesConsumer />
        <Application />
      </RolesProvider>,
    );
    await expect.element(screen.getByText('Claimable: reports-exporter')).toBeVisible();
    await screen.getByLabelText('Unsaved report').fill('Unsaved changes');

    window.dispatchEvent(new Event('focus'));

    await expect.element(screen.getByText('Claim Reports exporter', { exact: true })).toBeVisible();
    const dialog = screen.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Claim' }).click();
    await expect.element(dialog.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    first.reject(new Error('Activation service unavailable'));
    await expect
      .element(dialog.getByRole('alert'))
      .toHaveTextContent(
        'The role could not be activated. Try again or contact your administrator.',
      );
    expect(mocks.getClaimableRoles).toHaveBeenCalledTimes(2);
    await expect.element(dialog.getByLabelText('Reason')).toHaveValue('Continue active work');

    await dialog.getByRole('button', { name: 'Claim' }).click();
    await expect.element(dialog.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(dialog.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    // Recovery completes only after activation and both refreshed collections have settled.
    const refreshedRoles = Promise.withResolvers<(typeof activeAssignment)[]>();
    mocks.getClaimableRoles.mockReturnValue(refreshedRoles.promise);
    retry.resolve({ id: 'activation-id' });
    await vi.waitFor(() => expect(mocks.getClaimableRoles).toHaveBeenCalledTimes(3));
    await expect.element(dialog.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    refreshedRoles.resolve([activeAssignment]);
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText('Unsaved report')).toHaveValue('Unsaved changes');
    expect(onMount).toHaveBeenCalledOnce();
    expect(mocks.getClaimableRoles).toHaveBeenCalledTimes(3);
    await vi.waitFor(() =>
      expect(mocks.claimRole).toHaveBeenCalledWith({
        roleId: 'expiring-role',
        reason: 'Continue active work',
        hours: 2,
      }),
    );
  });
});

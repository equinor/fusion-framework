import { cleanup, render } from 'vitest-browser-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, type ReactNode } from 'react';

import { RolesProvider } from './RolesProvider';
import { useActiveAccessRoleAssignments } from '../hooks/useActiveAccessRoleAssignments';
import { useClaimableRoleAssignments } from '../hooks/useClaimableRoleAssignments';

const mocks = vi.hoisted(() => ({
  getActiveAccessRoleAssignments: vi.fn(),
  getConsolidatedClaimableRoleAssignments: vi.fn(),
  getConsolidatedRoleAssignments: vi.fn(),
  activateClaimableRoleAssignment: vi.fn(),
  deactivateClaimableRoleAssignment: vi.fn(),
  hasAccessRole: vi.fn(),
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
  const active = useActiveAccessRoleAssignments();
  const claimable = useClaimableRoleAssignments();
  const error =
    active.error ?? claimable.error ?? claimable.activationError ?? claimable.deactivationError;

  // Both domain requests must settle before assertions inspect their results.
  if (active.isLoading || claimable.isLoading) {
    return <p>Loading roles</p>;
  }
  // Provider errors remain visible through the hook state.
  if (error) {
    return <p role="alert">{String(error)}</p>;
  }
  // Flatten active access-role names into the compact assertion output.
  const activeRoleNames = active.assignments.map((role) => role.accessRoleName).join(', ');
  // Flatten claimable-role names into the compact assertion output.
  const claimableRoleNames = claimable.assignments
    .map((assignment) => assignment.claimableRole?.name)
    .join(', ');
  return (
    <>
      <p>Active: {activeRoleNames}</p>
      <p>Claimable: {claimableRoleNames}</p>
      <button
        type="button"
        onClick={() =>
          void claimable
            .activateClaimableRoleAssignment({ assignmentId: 'claimable-role' })
            .catch(() => undefined)
        }
      >
        Claim
      </button>
      <button
        type="button"
        onClick={() =>
          void claimable
            .deactivateClaimableRoleAssignment({ assignmentId: 'claimable-role' })
            .catch(() => undefined)
        }
      >
        Deactivate
      </button>
    </>
  );
};

describe('RolesProvider', () => {
  beforeEach(() => {
    mocks.getActiveAccessRoleAssignments.mockReset();
    mocks.getConsolidatedClaimableRoleAssignments.mockReset();
    mocks.getConsolidatedRoleAssignments.mockReset();
    mocks.activateClaimableRoleAssignment.mockReset();
    mocks.deactivateClaimableRoleAssignment.mockReset();
    mocks.hasAccessRole.mockReset();
    mocks.getActiveAccessRoleAssignments.mockResolvedValue([]);
    mocks.getConsolidatedClaimableRoleAssignments.mockResolvedValue([]);
    mocks.getConsolidatedRoleAssignments.mockResolvedValue([]);
    mocks.activateClaimableRoleAssignment.mockResolvedValue({ id: 'activation-id' });
    mocks.deactivateClaimableRoleAssignment.mockResolvedValue({ id: 'deactivation-id' });
    mocks.hasAccessRole.mockResolvedValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('shares both role domains and refreshes them after activation', async () => {
    mocks.getActiveAccessRoleAssignments
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ accessRoleName: 'Reports.Read' }]);
    mocks.getConsolidatedClaimableRoleAssignments
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
    expect(mocks.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2);
    expect(mocks.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledTimes(2);
  });

  it('exposes collection failures through the matching domain hook', async () => {
    mocks.getActiveAccessRoleAssignments.mockRejectedValue(new Error('active roles failed'));

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
      expect(mocks.deactivateClaimableRoleAssignment).toHaveBeenCalledWith({
        assignmentId: 'claimable-role',
      }),
    );
    expect(mocks.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2);
    expect(mocks.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledTimes(2);
  });

  it('gates children by the required roles', async () => {
    const screen = await render(
      <RolesProvider requiredAccessRoles={['Reports.Read']}>
        <RolesConsumer />
      </RolesProvider>,
    );

    await expect.element(screen.getByText('Active:', { exact: true })).toBeVisible();
    expect(mocks.hasAccessRole).toHaveBeenCalledWith(['Reports.Read'], {
      required: true,
      assert: true,
    });
  });

  it('exposes activation failures through claimable-role state', async () => {
    mocks.activateClaimableRoleAssignment.mockRejectedValue(new Error('activation failed'));
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

    await vi.waitFor(() => expect(mocks.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2));
    expect(mocks.getActiveAccessRoleAssignments).toHaveBeenLastCalledWith({ refresh: true });
    expect(mocks.getConsolidatedClaimableRoleAssignments).toHaveBeenLastCalledWith({
      refresh: true,
    });
  });

  it('retains expiry recovery after failed activation and closes only after a successful retry', async () => {
    const first = Promise.withResolvers<void>();
    const retry = Promise.withResolvers<{ id: string }>();
    mocks.activateClaimableRoleAssignment
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(retry.promise);
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
    mocks.getConsolidatedClaimableRoleAssignments
      .mockResolvedValueOnce([activeAssignment])
      .mockResolvedValue([
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
        'The claimable role assignment could not be activated. Try again or contact your administrator.',
      );
    expect(mocks.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledTimes(2);
    await expect.element(dialog.getByLabelText('Reason')).toHaveValue('Continue active work');

    await dialog.getByRole('button', { name: 'Claim' }).click();
    await expect.element(dialog.getByRole('alert')).not.toBeInTheDocument();
    await expect.element(dialog.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    // Recovery completes only after activation and both refreshed collections have settled.
    const refreshedRoles = Promise.withResolvers<(typeof activeAssignment)[]>();
    mocks.getConsolidatedClaimableRoleAssignments.mockReturnValue(refreshedRoles.promise);
    retry.resolve({ id: 'activation-id' });
    await vi.waitFor(() =>
      expect(mocks.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledTimes(3),
    );
    await expect.element(dialog.getByRole('button', { name: 'Claiming...' })).toBeDisabled();
    refreshedRoles.resolve([activeAssignment]);
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(screen.getByLabelText('Unsaved report')).toHaveValue('Unsaved changes');
    expect(onMount).toHaveBeenCalledOnce();
    expect(mocks.getConsolidatedClaimableRoleAssignments).toHaveBeenCalledTimes(3);
    await vi.waitFor(() =>
      expect(mocks.activateClaimableRoleAssignment).toHaveBeenCalledWith({
        assignmentId: 'expiring-role',
        reason: 'Continue active work',
        hours: 2,
      }),
    );
  });
});

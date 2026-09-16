import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';

import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import {
  ActivateClaimableRoleAssignmentError,
  enableRoles,
  type IRolesClient,
  RolesError,
  type RolesModule,
} from '@equinor/fusion-framework-module-roles';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import {
  type ClaimableRoleAssignmentActivationResult,
  useAccessRole,
} from '../roles/useAccessRole';

/**
 * Creates an app-scoped Roles client test double.
 *
 * @returns Client with mockable role operations.
 */
const createClient = (): IRolesClient => ({
  initialize: vi.fn(),
  getActiveAccessRoleAssignments: vi.fn(() => of([])),
  getConsolidatedClaimableRoleAssignments: vi.fn(() => of([])),
  getConsolidatedRoleAssignments: vi.fn(() => of([])),
  activateClaimableRoleAssignment: vi.fn(() => of({ id: 'activation-id' })),
  deactivateClaimableRoleAssignment: vi.fn(() => of({ id: 'activation-id' })),
  hasClaimableRoleAssignmentForAccessRole: vi.fn(() => of(false)),
  getRequiredAccessRoleStatuses: vi.fn(() => of([])),
  getAccessRoles: vi.fn(),
});

/**
 * Creates app module configuration backed by a supplied Roles client.
 *
 * @param client - Roles client exposed to the hook through app module initialization.
 * @returns App configuration callback that enables the Roles module.
 */
const configureRolesClient = (client: IRolesClient): AppMockConfigureFn<[RolesModule]> => {
  return (configurator) => {
    enableRoles(configurator, (builder) => {
      builder.setClient(client);
    });
  };
};

describe('useAccessRole', () => {
  it('checks active and claimable access when mounted', async () => {
    const client = createClient();
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(
      of([
        {
          systemName: 'Reports',
          accessRoleName: 'Reports.Read',
          assignmentType: 'Global',
        },
      ]),
    );
    vi.mocked(client.hasClaimableRoleAssignmentForAccessRole).mockReturnValue(of(true));

    const { result, unmount } = await renderAppHook(() => useAccessRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });

    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.hasAccessRole).toBe(true);
    expect(result.current.hasClaimableRoleAssignmentForAccessRole).toBe(true);
    expect(result.current.checkError).toBeUndefined();
    expect(client.hasClaimableRoleAssignmentForAccessRole).toHaveBeenCalledWith('Reports.Read');

    await unmount();
  });

  it('surfaces role check failures without producing access results', async () => {
    const client = createClient();
    const error = new Error('role check failed');
    vi.mocked(client.getActiveAccessRoleAssignments).mockReturnValue(throwError(() => error));

    const { result, unmount } = await renderAppHook(() => useAccessRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });

    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.hasAccessRole).toBeUndefined();
    expect(result.current.hasClaimableRoleAssignmentForAccessRole).toBeUndefined();
    expect(result.current.checkError).toBeInstanceOf(RolesError);
    expect(result.current.checkError).toMatchObject({ cause: error });

    await unmount();
  });

  it('claims a role and refreshes access state after activation', async () => {
    const client = createClient();
    vi.mocked(client.getActiveAccessRoleAssignments)
      .mockReturnValueOnce(of([]))
      .mockReturnValue(
        of([
          {
            systemName: 'Reports',
            accessRoleName: 'Reports.Read',
            assignmentType: 'Global',
          },
        ]),
      );
    vi.mocked(client.hasClaimableRoleAssignmentForAccessRole)
      .mockReturnValueOnce(of(true))
      .mockReturnValue(of(false));

    const { result, unmount } = await renderAppHook(() => useAccessRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));

    await act(async () => {
      await expect(
        result.current.activateClaimableRoleAssignment({
          assignmentId: 'claimable-role',
          reason: 'Open reports',
          hours: 2,
        }),
      ).resolves.toEqual({ id: 'activation-id' });
    });

    await vi.waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.hasAccessRole).toBe(true);
    });
    expect(result.current.isActivating).toBe(false);
    expect(result.current.activationError).toBeUndefined();
    expect(client.activateClaimableRoleAssignment).toHaveBeenCalledWith({
      assignmentId: 'claimable-role',
      reason: 'Open reports',
      hours: 2,
    });
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(2);

    await unmount();
  });

  it('surfaces and rethrows claim failures', async () => {
    const client = createClient();
    const error = new Error('claim failed');
    vi.mocked(client.activateClaimableRoleAssignment).mockReturnValue(throwError(() => error));

    const { result, unmount } = await renderAppHook(() => useAccessRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));

    await act(async () => {
      await expect(
        result.current.activateClaimableRoleAssignment({
          assignmentId: 'claimable-role',
          reason: 'Test activation',
          hours: 2,
        }),
      ).rejects.toMatchObject({
        name: 'ActivateClaimableRoleAssignmentError',
        cause: error,
      });
    });

    expect(result.current.isActivating).toBe(false);
    expect(result.current.activationError).toBeInstanceOf(ActivateClaimableRoleAssignmentError);
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledOnce();

    await unmount();
  });

  it('stays activating until every overlapping activation settles', async () => {
    const client = createClient();
    const firstActivation = new Subject<{ id: string }>();
    const secondActivation = new Subject<{ id: string }>();
    vi.mocked(client.activateClaimableRoleAssignment)
      .mockReturnValueOnce(firstActivation)
      .mockReturnValueOnce(secondActivation);

    const { result, unmount } = await renderAppHook(() => useAccessRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));

    let firstPromise!: Promise<ClaimableRoleAssignmentActivationResult>;
    let secondPromise!: Promise<ClaimableRoleAssignmentActivationResult>;
    act(() => {
      firstPromise = result.current.activateClaimableRoleAssignment({
        assignmentId: 'first-assignment',
        reason: 'First test activation',
        hours: 2,
      });
      secondPromise = result.current.activateClaimableRoleAssignment({
        assignmentId: 'second-assignment',
        reason: 'Second test activation',
        hours: 2,
      });
    });
    expect(result.current.isActivating).toBe(true);
    await vi.waitFor(() => expect(client.activateClaimableRoleAssignment).toHaveBeenCalledTimes(2));

    await act(async () => {
      firstActivation.next({ id: 'first-activation' });
      firstActivation.complete();
      await expect(firstPromise).resolves.toEqual({ id: 'first-activation' });
    });
    expect(result.current.isActivating).toBe(true);

    await act(async () => {
      secondActivation.next({ id: 'second-activation' });
      secondActivation.complete();
      await expect(secondPromise).resolves.toEqual({ id: 'second-activation' });
    });
    expect(result.current.isActivating).toBe(false);

    await unmount();
  });

  it('ignores activation completion after the requested access role changes', async () => {
    const client = createClient();
    const activation = new Subject<{ id: string }>();
    vi.mocked(client.activateClaimableRoleAssignment).mockReturnValue(activation);

    const { result, rerender, unmount } = await renderAppHook(
      (accessRoleName) => useAccessRole(accessRoleName),
      {
        initialProps: 'Reports.Read',
        configure: configureRolesClient(client),
      },
    );
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));

    let activationPromise!: Promise<ClaimableRoleAssignmentActivationResult>;
    act(() => {
      activationPromise = result.current.activateClaimableRoleAssignment({
        assignmentId: 'reports-assignment',
        reason: 'Test activation',
        hours: 2,
      });
    });
    expect(result.current.isActivating).toBe(true);
    await vi.waitFor(() => expect(client.activateClaimableRoleAssignment).toHaveBeenCalledOnce());

    await rerender('Reports.Export');
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.isActivating).toBe(false);
    const checkCountAfterRoleChange = vi.mocked(client.getActiveAccessRoleAssignments).mock.calls
      .length;

    await act(async () => {
      activation.next({ id: 'reports-activation' });
      activation.complete();
      await expect(activationPromise).resolves.toEqual({ id: 'reports-activation' });
    });
    expect(client.getActiveAccessRoleAssignments).toHaveBeenCalledTimes(checkCountAfterRoleChange);
    expect(result.current.isActivating).toBe(false);

    await unmount();
  });
});

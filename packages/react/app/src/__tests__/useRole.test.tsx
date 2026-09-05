import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import {
  ClaimRoleError,
  enableRoles,
  type IRolesClient,
  RolesError,
  type RolesModule,
} from '@equinor/fusion-framework-module-roles';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { useRole } from '../roles/useRole';

/**
 * Creates an app-scoped Roles client test double.
 *
 * @returns Client with mockable role operations.
 */
const createClient = (): IRolesClient => ({
  initialize: vi.fn(),
  getActiveRoles: vi.fn(() => of([])),
  getClaimableRoles: vi.fn(() => of([])),
  claimRole: vi.fn(() => of({ id: 'activation-id' })),
  deactivateRole: vi.fn(() => of({ id: 'activation-id' })),
  canClaimAccessRole: vi.fn(() => of(false)),
  getRequiredRoleStatuses: vi.fn(() => of([])),
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

describe('useRole', () => {
  it('checks active and claimable access when mounted', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles).mockReturnValue(
      of([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }]),
    );
    vi.mocked(client.canClaimAccessRole).mockReturnValue(of(true));

    const { result, unmount } = await renderAppHook(() => useRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });

    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.hasRole).toBe(true);
    expect(result.current.canClaimAccessRole).toBe(true);
    expect(result.current.checkError).toBeUndefined();
    expect(client.canClaimAccessRole).toHaveBeenCalledWith('Reports.Read');

    await unmount();
  });

  it('surfaces role check failures without producing access results', async () => {
    const client = createClient();
    const error = new Error('role check failed');
    vi.mocked(client.getActiveRoles).mockReturnValue(throwError(() => error));

    const { result, unmount } = await renderAppHook(() => useRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });

    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.hasRole).toBeUndefined();
    expect(result.current.canClaimAccessRole).toBeUndefined();
    expect(result.current.checkError).toBeInstanceOf(RolesError);
    expect(result.current.checkError).toMatchObject({ cause: error });

    await unmount();
  });

  it('claims a role and refreshes access state after activation', async () => {
    const client = createClient();
    vi.mocked(client.getActiveRoles)
      .mockReturnValueOnce(of([]))
      .mockReturnValue(of([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }]));
    vi.mocked(client.canClaimAccessRole).mockReturnValueOnce(of(true)).mockReturnValue(of(false));

    const { result, unmount } = await renderAppHook(() => useRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));

    await act(async () => {
      await expect(
        result.current.claimRole({ roleId: 'claimable-role', reason: 'Open reports' }),
      ).resolves.toEqual({ id: 'activation-id' });
    });

    await vi.waitFor(() => {
      expect(result.current.isChecking).toBe(false);
      expect(result.current.hasRole).toBe(true);
    });
    expect(result.current.isClaiming).toBe(false);
    expect(result.current.claimError).toBeUndefined();
    expect(client.claimRole).toHaveBeenCalledWith({
      roleId: 'claimable-role',
      reason: 'Open reports',
    });
    expect(client.getActiveRoles).toHaveBeenCalledTimes(2);

    await unmount();
  });

  it('surfaces and rethrows claim failures', async () => {
    const client = createClient();
    const error = new Error('claim failed');
    vi.mocked(client.claimRole).mockReturnValue(throwError(() => error));

    const { result, unmount } = await renderAppHook(() => useRole('Reports.Read'), {
      configure: configureRolesClient(client),
    });
    await vi.waitFor(() => expect(result.current.isChecking).toBe(false));

    await act(async () => {
      await expect(result.current.claimRole({ roleId: 'claimable-role' })).rejects.toMatchObject({
        name: 'ClaimRoleError',
        cause: error,
      });
    });

    expect(result.current.isClaiming).toBe(false);
    expect(result.current.claimError).toBeInstanceOf(ClaimRoleError);
    expect(client.getActiveRoles).toHaveBeenCalledOnce();

    await unmount();
  });
});

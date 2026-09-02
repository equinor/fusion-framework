import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

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
  getActiveRoles: vi.fn().mockResolvedValue([]),
  getClaimableRoles: vi.fn().mockResolvedValue([]),
  claimRole: vi.fn().mockResolvedValue({ id: 'activation-id' }),
  canClaimAccessRole: vi.fn().mockResolvedValue(false),
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
    vi.mocked(client.getActiveRoles).mockResolvedValue([
      { systemName: 'Reports', accessRoleName: 'Reports.Read' },
    ]);
    vi.mocked(client.canClaimAccessRole).mockResolvedValue(true);

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
    vi.mocked(client.getActiveRoles).mockRejectedValue(error);

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
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ systemName: 'Reports', accessRoleName: 'Reports.Read' }]);
    vi.mocked(client.canClaimAccessRole).mockResolvedValueOnce(true).mockResolvedValue(false);

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
    vi.mocked(client.claimRole).mockRejectedValue(error);

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

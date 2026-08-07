import { describe, expect, it, vi } from 'vitest';

import { RolesApi, type RolesClient } from './RolesApi';

/** Creates a typed Roles V2 client mock around a Vitest function. */
const createClient = (): { client: RolesClient; json: ReturnType<typeof vi.fn> } => {
  const json = vi.fn();
  return { client: { json }, json };
};

describe('RolesApi', () => {
  it('loads consolidated claimable and permanent assignments', async () => {
    const { client, json } = createClient();
    json.mockResolvedValueOnce([{ id: 'claimable' }]).mockResolvedValueOnce([{ id: 'permanent' }]);
    const rolesApi = new RolesApi(client, 'account-id');

    await expect(rolesApi.getClaimableRoles()).resolves.toEqual([{ id: 'claimable' }]);
    await expect(rolesApi.getPermanentRoles()).resolves.toEqual([{ id: 'permanent' }]);
    expect(json).toHaveBeenNthCalledWith(
      1,
      '/accounts/account-id/consolidated-claimable-role-assignments',
    );
    expect(json).toHaveBeenNthCalledWith(2, '/accounts/account-id/consolidated-role-assignments');
  });

  it('sends the activation reason and duration to the claimable assignment', async () => {
    const { client, json } = createClient();
    json.mockResolvedValue({ activeToDate: '2026-08-07T12:00:00Z' });
    const rolesApi = new RolesApi(client, 'account-id');

    await expect(rolesApi.activateRole('role-id', 'Testing elevated access', 4)).resolves.toEqual({
      activeToDate: '2026-08-07T12:00:00Z',
    });
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/claimable-role-assignments/role-id/activate',
      {
        method: 'POST',
        body: JSON.stringify({ reason: 'Testing elevated access', hours: 4 }),
      },
    );
  });

  it('posts deactivation to the active claimable assignment', async () => {
    const { client, json } = createClient();
    json.mockResolvedValue(undefined);
    const rolesApi = new RolesApi(client, 'account-id');

    await expect(rolesApi.deactivateRole('role-id')).resolves.toBeUndefined();
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/claimable-role-assignments/role-id/deactivate',
      { method: 'POST' },
    );
  });

  it('propagates service failures to the role UI', async () => {
    const { client, json } = createClient();
    json.mockRejectedValue(new Error('Roles service unavailable'));
    const rolesApi = new RolesApi(client, 'account-id');

    await expect(rolesApi.getClaimableRoles()).rejects.toThrow('Roles service unavailable');
  });
});

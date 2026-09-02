import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { describe, expect, it, vi } from 'vitest';

import { RolesClient } from '../RolesClient.js';

/**
 * Creates an HTTP client whose JSON method can be controlled without performing network I/O.
 *
 * @returns Framework HTTP client and its JSON spy.
 */
const createHttpClient = () => {
  const httpClient = new HttpClient('https://roles.example.test');
  const json = vi.spyOn(httpClient, 'json');
  return { httpClient, json };
};

describe('RolesClient', () => {
  it('gets active roles for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    json.mockResolvedValue(activeRoles);
    const client = new RolesClient(httpClient, 'account/id');

    await expect(client.getActiveRoles()).resolves.toEqual(activeRoles);

    expect(json).toHaveBeenCalledWith(
      '/accounts/account%2Fid/active-access-role-assignments?api-version=1.0',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
  });

  it('gets consolidated claimable roles for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const claimableRoles = [{ id: 'claimable-role' }];
    json.mockResolvedValue(claimableRoles);
    const client = new RolesClient(httpClient, 'account-id');

    await expect(client.getClaimableRoles()).resolves.toEqual(claimableRoles);
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/consolidated-claimable-role-assignments?api-version=1.0',
      expect.objectContaining({ selector: expect.any(Function) }),
    );
  });

  it('claims a role for the scoped account', async () => {
    const { httpClient, json } = createHttpClient();
    const activation = { id: 'activation-id', activeToDate: '2026-09-02T14:00:00Z' };
    json.mockResolvedValue(activation);
    const client = new RolesClient(httpClient, 'account-id');

    await expect(
      client.claimRole({
        roleId: 'role/id',
        reason: 'Incident response',
        hours: 2,
      }),
    ).resolves.toEqual(activation);
    expect(json).toHaveBeenCalledWith(
      '/accounts/account-id/claimable-role-assignments/role%2Fid/activate?api-version=1.0',
      expect.objectContaining({
        method: 'POST',
        body: {
          reason: 'Incident response',
          hours: 2,
        },
        selector: expect.any(Function),
      }),
    );
  });

  it('propagates request failures from Roles V2', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockRejectedValue(new Error('request failed'));
    const client = new RolesClient(httpClient, 'account-id');

    await expect(client.getActiveRoles()).rejects.toThrow('request failed');
  });

  it('checks expanded access-role mappings for claim eligibility', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockResolvedValue({
      totalCount: 1,
      value: [
        {
          claimableRole: {
            accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }],
          },
        },
      ],
    });
    const client = new RolesClient(httpClient, 'account-id');

    await expect(client.canClaimAccessRole('Reports.Read')).resolves.toBe(true);
    await expect(client.canClaimAccessRole('Reports.Write')).resolves.toBe(false);
    expect(json.mock.calls[0][0]).toBe(
      '/accounts/account-id/claimable-role-assignments?api-version=1.0&%24expand=accessRoleMappings',
    );
  });

  it('throws rather than returning false for an incomplete claim eligibility response', async () => {
    const { httpClient, json } = createHttpClient();
    json.mockResolvedValue({
      totalCount: 2,
      nextPage: '/accounts/account-id/claimable-role-assignments?page=2',
      value: [],
    });
    const client = new RolesClient(httpClient, 'account-id');

    await expect(client.canClaimAccessRole('Reports.Read')).rejects.toThrow(
      'Roles V2 returned incomplete claimable role assignments while checking claim eligibility.',
    );
  });

  it('caches reads and invalidates them after a successful claim', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    const claimableRoles = [{ id: 'claimable-role' }];
    const claimability = {
      totalCount: 1,
      value: [
        {
          claimableRole: {
            accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }],
          },
        },
      ],
    };
    const activation = { id: 'activation-id' };
    json
      .mockResolvedValueOnce(activeRoles)
      .mockResolvedValueOnce(claimableRoles)
      .mockResolvedValueOnce(claimability)
      .mockResolvedValueOnce(activation)
      .mockResolvedValueOnce(activeRoles)
      .mockResolvedValueOnce(claimableRoles)
      .mockResolvedValueOnce(claimability);
    const client = new RolesClient(httpClient, 'account-id');

    await Promise.all([client.getActiveRoles(), client.getActiveRoles()]);
    await Promise.all([client.getClaimableRoles(), client.getClaimableRoles()]);
    await Promise.all([
      client.canClaimAccessRole('Reports.Read'),
      client.canClaimAccessRole('Reports.Read'),
    ]);
    expect(json).toHaveBeenCalledTimes(3);

    await client.claimRole({ roleId: 'claimable-role' });
    await client.getActiveRoles();
    await client.getClaimableRoles();
    await client.canClaimAccessRole('Reports.Read');

    expect(json).toHaveBeenCalledTimes(7);
  });

  it('refreshes cached reads after one minute', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    json.mockResolvedValue(activeRoles);
    let now = Date.now();
    const dateNow = vi.spyOn(Date, 'now').mockImplementation(() => now);
    const client = new RolesClient(httpClient, 'account-id');

    await client.getActiveRoles();
    await client.getActiveRoles();
    expect(json).toHaveBeenCalledOnce();

    now += 60 * 1000 + 1;
    await client.getActiveRoles();
    expect(json).toHaveBeenCalledTimes(2);

    dateNow.mockRestore();
  });

  it('preserves cached reads when a claim fails', async () => {
    const { httpClient, json } = createHttpClient();
    const activeRoles = [{ systemName: 'Fusion', accessRoleName: 'Reader' }];
    const claimableRoles = [{ id: 'claimable-role' }];
    const claimability = {
      totalCount: 1,
      value: [
        {
          claimableRole: {
            accessRoleMappings: [{ accessRole: { name: 'Reports.Read' } }],
          },
        },
      ],
    };
    json
      .mockResolvedValueOnce(activeRoles)
      .mockResolvedValueOnce(claimableRoles)
      .mockResolvedValueOnce(claimability)
      .mockRejectedValueOnce(new Error('claim failed'));
    const client = new RolesClient(httpClient, 'account-id');

    await client.getActiveRoles();
    await client.getClaimableRoles();
    await client.canClaimAccessRole('Reports.Read');
    await expect(client.claimRole({ roleId: 'claimable-role' })).rejects.toThrow('claim failed');

    await client.getActiveRoles();
    await client.getClaimableRoles();
    await client.canClaimAccessRole('Reports.Read');
    expect(json).toHaveBeenCalledTimes(4);
  });
});

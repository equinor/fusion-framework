import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { describe, expect, it, vi } from 'vitest';

import { module as realModule } from '../../module.js';
import type { RolesProvider } from '../../RolesProvider.js';
import {
  enableRolesMock,
  type RolesMockConfigFn,
  type RolesMockData,
  RolesMockConfigurator,
  rolesMockModule,
} from '../../mock/index.js';

/**
 * Initializes the mock through the framework module lifecycle.
 *
 * @param data - Static role data exposed through the production provider.
 * @param configure - Optional inherited Roles configuration.
 * @returns The production Roles provider backed by the static client.
 */
const initializeMockWith = async (
  data?: RolesMockData,
  configure?: RolesMockConfigFn,
): Promise<RolesProvider> => {
  const configurator = new ModulesConfigurator([]);
  enableRolesMock(configurator, (mock, ref) => {
    if (data) {
      mock.setData(data);
    }
    return configure?.(mock, ref);
  });
  const instances = await configurator.initialize();
  return (instances as unknown as { roles: RolesProvider }).roles;
};

describe('rolesMockModule', () => {
  it('reuses the production module initializer', () => {
    expect(rolesMockModule.name).toBe(realModule.name);
    expect(rolesMockModule.initialize).toBe(realModule.initialize);
    expect(rolesMockModule.configure?.()).toBeInstanceOf(RolesMockConfigurator);
  });

  it('initializes without service discovery or authentication', async () => {
    const provider = await initializeMockWith();

    await expect(provider.getActiveRoles()).resolves.toEqual([]);
    await expect(provider.getClaimableRoles()).resolves.toEqual([]);
  });

  it('exposes static role data through the production provider', async () => {
    const activeRole = { systemName: 'Reports', accessRoleName: 'Reports.Read' };
    const claimableRole = { id: 'assignment-id', claimableRole: { id: 'role-id' } };
    const provider = await initializeMockWith(undefined, (mock) => {
      mock
        .setActiveRoles([activeRole])
        .setClaimableRoles([claimableRole])
        .requireRoles(['Reports.Read']);
    });

    await expect(provider.hasRole(['Reports.Read'], { required: true })).resolves.toBe(true);
    await expect(provider.getClaimableRoles()).resolves.toEqual([claimableRole]);
  });

  it('lets setData replace both static role lists', async () => {
    const activeRole = { accessRoleName: 'Reports.Read' };
    const claimableRole = { id: 'assignment-id' };
    const provider = await initializeMockWith(undefined, (mock) => {
      mock
        .setActiveRoles([{ accessRoleName: 'discarded' }])
        .setData({ activeRoles: [activeRole], claimableRoles: [claimableRole] });
    });

    await expect(provider.getActiveRoles()).resolves.toEqual([activeRole]);
    await expect(provider.getClaimableRoles()).resolves.toEqual([claimableRole]);
  });

  it('lets tests override consumer behavior on the production provider', async () => {
    const provider = await initializeMockWith();
    const activation = { id: 'activation-id' };
    vi.spyOn(provider, 'canClaimAccessRole').mockResolvedValue(true);
    vi.spyOn(provider, 'claimRole').mockResolvedValue(activation);

    await expect(provider.canClaimAccessRole('Reports.Export')).resolves.toBe(true);
    await expect(provider.claimRole({ roleId: 'assignment-id' })).resolves.toEqual(activation);
  });

  it('rejects initialization when static active roles do not satisfy requirements', async () => {
    await expect(
      initializeMockWith({}, (mock) => mock.requireRoles(['Reports.Read'])),
    ).rejects.toMatchObject({
      name: 'RequiredRolesError',
      missingRoles: ['Reports.Read'],
    });
  });
});

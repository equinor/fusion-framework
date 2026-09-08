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

    await expect(provider.getActiveAccessRoleAssignments()).resolves.toEqual([]);
    await expect(provider.getConsolidatedClaimableRoleAssignments()).resolves.toEqual([]);
    await expect(provider.getConsolidatedRoleAssignments()).resolves.toEqual([]);
  });

  it('exposes static role data through the production provider', async () => {
    const activeRole = { systemName: 'Reports', accessRoleName: 'Reports.Read' };
    const claimableRole = { id: 'assignment-id', claimableRole: { id: 'role-id' } };
    const consolidatedRole = { id: 'assigned-id', role: { name: 'Reports.Admin' } };
    const provider = await initializeMockWith(undefined, (mock) => {
      mock
        .setActiveAccessRoleAssignments([activeRole])
        .setConsolidatedClaimableRoleAssignments([claimableRole])
        .setConsolidatedRoleAssignments([consolidatedRole])
        .requireAccessRoles(['Reports.Read']);
    });

    await expect(provider.hasAccessRole(['Reports.Read'], { required: true })).resolves.toBe(true);
    await expect(provider.getConsolidatedClaimableRoleAssignments()).resolves.toEqual([
      claimableRole,
    ]);
    await expect(provider.getConsolidatedRoleAssignments()).resolves.toEqual([consolidatedRole]);
  });

  it('lets setData replace all static role lists', async () => {
    const activeRole = { accessRoleName: 'Reports.Read' };
    const claimableRole = { id: 'assignment-id' };
    const consolidatedRole = { id: 'assigned-id' };
    const provider = await initializeMockWith(undefined, (mock) => {
      mock.setActiveAccessRoleAssignments([{ accessRoleName: 'discarded' }]).setData({
        activeAccessRoleAssignments: [activeRole],
        consolidatedClaimableRoleAssignments: [claimableRole],
        consolidatedRoleAssignments: [consolidatedRole],
      });
    });

    await expect(provider.getActiveAccessRoleAssignments()).resolves.toEqual([activeRole]);
    await expect(provider.getConsolidatedClaimableRoleAssignments()).resolves.toEqual([
      claimableRole,
    ]);
    await expect(provider.getConsolidatedRoleAssignments()).resolves.toEqual([consolidatedRole]);
  });

  it('lets tests override consumer behavior on the production provider', async () => {
    const provider = await initializeMockWith();
    const activation = { id: 'activation-id' };
    vi.spyOn(provider, 'hasClaimableRoleAssignmentForAccessRole').mockResolvedValue(true);
    vi.spyOn(provider, 'activateClaimableRoleAssignment').mockResolvedValue(activation);

    await expect(provider.hasClaimableRoleAssignmentForAccessRole('Reports.Export')).resolves.toBe(
      true,
    );
    await expect(
      provider.activateClaimableRoleAssignment({ assignmentId: 'assignment-id' }),
    ).resolves.toEqual(activation);
  });

  it('rejects initialization when static active roles do not satisfy requirements', async () => {
    await expect(
      initializeMockWith({}, (mock) => mock.requireAccessRoles(['Reports.Read'])),
    ).rejects.toMatchObject({
      name: 'RequiredAccessRolesError',
      missingAccessRoles: ['Reports.Read'],
    });
  });
});

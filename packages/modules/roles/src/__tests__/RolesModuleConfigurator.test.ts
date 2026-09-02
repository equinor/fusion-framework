import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RolesModuleConfigurator } from '../RolesModuleConfigurator.js';

const configBuilderArgs: ConfigBuilderCallbackArgs = {
  config: {},
  hasModule: () => false,
  requireInstance: () => Promise.reject(new Error('No modules are available in this test.')),
};

describe('RolesModuleConfigurator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes and deduplicates required role names', async () => {
    const configurator = new RolesModuleConfigurator();

    configurator.requireRoles([' Reports.Read ', 'Reports.Read', 'Reports.Export']);

    await expect(configurator.createConfigAsync(configBuilderArgs)).resolves.toEqual({
      requiredRoles: ['Reports.Read', 'Reports.Export'],
    });
  });

  it('rejects empty required role names', () => {
    const configurator = new RolesModuleConfigurator();

    expect(() => configurator.requireRoles(['Reports.Read', '  '])).toThrow(
      'Required role names must be non-empty strings.',
    );
  });

  it('resolves and combines role requirement builders', async () => {
    const configurator = new RolesModuleConfigurator();
    configurator.requireRoles(['Reports.Read']);
    configurator.requireRoles(async () => [' Reports.Export ', 'Reports.Read']);

    await expect(configurator.createConfigAsync(configBuilderArgs)).resolves.toEqual({
      requiredRoles: ['Reports.Read', 'Reports.Export'],
    });
  });

  it.each([
    ['no role array', async () => undefined],
    ['an empty role name', async () => ['Reports.Read', '  ']],
  ])('rejects when a role requirement builder returns %s', async (_, roleBuilder) => {
    const configurator = new RolesModuleConfigurator();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configurator.requireRoles(roleBuilder);

    await expect(configurator.createConfigAsync(configBuilderArgs)).rejects.toThrow(
      'Failed to resolve required role configuration.',
    );
  });

  it.each([
    [
      'rejects',
      async () => {
        throw new Error('client failed');
      },
    ],
    ['returns no client', async () => undefined],
  ])('rejects when a configured client builder %s', async (_, clientBuilder) => {
    const configurator = new RolesModuleConfigurator();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configurator.setClient(clientBuilder);

    await expect(configurator.createConfigAsync(configBuilderArgs)).rejects.toThrow(
      'Failed to resolve configured Roles client.',
    );
  });
});

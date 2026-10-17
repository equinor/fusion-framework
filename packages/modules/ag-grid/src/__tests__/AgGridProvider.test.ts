import { describe, expect, it } from 'vitest';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { AgGridProvider } from '../AgGridProvider.js';
import { module as agGridModule } from '../module.js';
import { version } from '../version.js';

describe('AgGridProvider', () => {
  it('extends BaseModuleProvider and exposes the package version', () => {
    const provider = new AgGridProvider({ licenseKey: 'test-key' });

    expect(provider).toBeInstanceOf(BaseModuleProvider);
    expect(String(provider.version)).toBe(version);
    expect(provider.licenseKey).toBe('test-key');
  });

  it('does not emit provider warnings when initialized through the configurator', async () => {
    const configurator = new ModulesConfigurator([agGridModule]);
    const eventNames: string[] = [];
    const subscription = configurator.event$.subscribe((event) => eventNames.push(event.name));

    const instance = await configurator.initialize();

    expect(instance.agGrid).toBeInstanceOf(BaseModuleProvider);
    expect(eventNames.filter((name) => name.includes('ModuleConfigurator.provider.'))).toEqual([]);

    subscription.unsubscribe();
    await configurator.dispose(instance);
  });
});

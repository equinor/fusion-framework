import { describe, expect, it } from 'vitest';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

import { SignalRModuleProvider } from '../SignalRModuleProvider.js';
import { module as signalRModule } from '../SignalRModule.js';
import { version } from '../version.js';

describe('SignalRModuleProvider', () => {
  it('extends BaseModuleProvider and exposes the package version', () => {
    const provider = new SignalRModuleProvider({ hubs: {} });

    expect(provider).toBeInstanceOf(BaseModuleProvider);
    expect(String(provider.version)).toBe(version);
  });

  it('throws when connecting to a hub that was never configured', () => {
    const provider = new SignalRModuleProvider({ hubs: {} });

    expect(() => provider.connect('missing', 'OnMessage')).toThrow(
      'could not find any configuration for hub [missing]',
    );
  });

  it('does not emit provider warnings when initialized through the configurator', async () => {
    const configurator = new ModulesConfigurator([signalRModule]);
    const eventNames: string[] = [];
    const subscription = configurator.event$.subscribe((event) => eventNames.push(event.name));

    const instance = await configurator.initialize();

    expect(instance.signalR).toBeInstanceOf(BaseModuleProvider);
    expect(eventNames.filter((name) => name.includes('ModuleConfigurator.provider.'))).toEqual([]);

    subscription.unsubscribe();
    await configurator.dispose(instance);
  });
});

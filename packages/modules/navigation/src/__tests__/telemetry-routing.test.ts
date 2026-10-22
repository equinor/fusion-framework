import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type ITelemetryProvider,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';
import navigation, { type NavigationModule } from '../module.js';
import { MemoryHistory } from '../lib/MemoryHistory.js';
import { NavigationProvider } from '../NavigationProvider.js';
import type { INavigationConfigurator } from '../NavigationConfigurator.interface.js';

afterEach(() => vi.restoreAllMocks());

describe('optional navigation telemetry', () => {
  it.each([false, true])('preserves explicit telemetry disable: %s', async (disabled) => {
    const config = new ModulesConfigurator();
    const processItem = vi.fn();
    enableTelemetry(config, {
      configure: (builder) => {
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
    config.addConfig({
      module: navigation,
      configure: (builder) => {
        builder.setHistory(new MemoryHistory(), { proxy: false });
        if (disabled) builder.setTelemetry(undefined);
      },
    });
    const modules = await config.initialize<[TelemetryModule, NavigationModule]>();
    modules.navigation.push('/secret?token=sentinel', { body: 'sentinel' });
    await vi.waitFor(() => {
      expect(processItem.mock.calls.some(([item]) => item.name === 'Navigation::navigated')).toBe(
        !disabled,
      );
    });
    expect(processItem.mock.calls.some(([item]) => item.name === 'Navigation::action')).toBe(false);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('sentinel');
    await modules.dispose();
    const count = processItem.mock.calls.length;
    expect(processItem).toHaveBeenCalledTimes(count);
  });

  it('reports a missing history as a failed notification', () => {
    const trackEvent = vi.fn();
    const telemetry = {
      source: { source: 'app', hostId: 'host' },
      trackEvent,
    } as unknown as ITelemetryProvider;
    expect(
      () =>
        new NavigationProvider({
          version: '1.0.0',
          config: { telemetry } as INavigationConfigurator,
        }),
    ).toThrow();
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Navigation::history.required',
        diagnostic: expect.objectContaining({ outcome: 'failure' }),
      }),
    );
  });

  it('initializes and navigates without a telemetry module', async () => {
    const config = new ModulesConfigurator();
    config.addConfig({
      module: navigation,
      configure: (builder) => builder.setHistory(new MemoryHistory(), { proxy: false }),
    });
    const modules = await config.initialize<[NavigationModule]>();
    expect(() => modules.navigation.push('/business')).not.toThrow();
    await modules.dispose();
  });
});

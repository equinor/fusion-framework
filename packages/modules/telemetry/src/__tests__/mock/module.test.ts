import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as telemetryModule } from '../../module.js';
import { TelemetryMockConfigurator } from '../../mock/TelemetryMockConfigurator.js';
import { enableTelemetryMock, telemetryMockModule } from '../../mock/module.js';
import type { TelemetryProvider } from '../../TelemetryProvider.js';

describe('telemetryMockModule', () => {
  it('matches the real module name and initialize path', () => {
    expect(telemetryMockModule.name).toBe(telemetryModule.name);
    expect(telemetryMockModule.initialize).toBe(telemetryModule.initialize);
  });

  it('builds a TelemetryMockConfigurator', async () => {
    const configurator = await telemetryMockModule.configure?.();

    expect(configurator).toBeInstanceOf(TelemetryMockConfigurator);
  });
});

describe('enableTelemetryMock', () => {
  it('records a tracked event via its own adapter, resolved through the module system', async () => {
    let recorder: TelemetryMockConfigurator['adapter'] | undefined;
    const configurator = new ModulesConfigurator([]);
    enableTelemetryMock(configurator, (builder) => {
      recorder = builder.adapter;
    });

    const instances = await configurator.initialize();
    const provider = (instances as unknown as { telemetry: TelemetryProvider }).telemetry;

    provider.trackEvent({ name: 'button-click' });

    await vi.waitFor(() => {
      expect(recorder?.getItems('button-click')).toHaveLength(1);
    });
  });

  it('replaces an already registered telemetry module', async () => {
    let recorder: TelemetryMockConfigurator['adapter'] | undefined;
    const configurator = new ModulesConfigurator([telemetryModule]);
    enableTelemetryMock(configurator, (builder) => {
      recorder = builder.adapter;
    });

    const instances = await configurator.initialize();
    const provider = (instances as unknown as { telemetry: TelemetryProvider }).telemetry;

    provider.trackEvent({ name: 'button-click' });

    await vi.waitFor(() => {
      expect(recorder?.getItems('button-click')).toHaveLength(1);
    });
  });
});

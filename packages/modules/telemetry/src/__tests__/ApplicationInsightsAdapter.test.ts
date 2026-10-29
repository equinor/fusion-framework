import { afterEach, describe, expect, it, vi } from 'vitest';
import { TelemetryLevel, TelemetryType } from '@equinor/fusion-framework-module-telemetry';
import { createOperationalRecords } from '../utils/create-operational-records.js';

const client = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackMetric: vi.fn(),
  trackException: vi.fn(),
  loadAppInsights: vi.fn(),
  addPlugin: vi.fn(),
}));

vi.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: vi.fn(function ApplicationInsights() {
    return client;
  }),
}));

const { ApplicationInsightsAdapter } = await import(
  '../adapters/application-insights/ApplicationInsightsAdapter.js'
);

afterEach(() => {
  vi.clearAllMocks();
});

describe('ApplicationInsightsAdapter', () => {
  it('omits metadata when a record has none instead of exporting "undefined"', async () => {
    const adapter = new ApplicationInsightsAdapter({ snippet: { config: {} } });
    await adapter.initialize();
    const [record] = createOperationalRecords({
      source: { source: 'framework', hostId: 'host-1' },
      module: 'service-discovery',
      operation: 'resolve',
      outcome: 'success',
      duration: 3,
    });
    // Built-in envelopes carry an explicit undefined metadata key after the provider strips it.
    adapter.processItem({ ...record, metadata: undefined });

    const [{ properties }] = client.trackMetric.mock.calls[0];
    expect(properties).not.toHaveProperty('metadata');
    expect(properties).toEqual({ diagnostic: record.diagnostic });
  });

  it('keeps metadata and custom properties when present', async () => {
    const adapter = new ApplicationInsightsAdapter({ snippet: { config: {} } });
    await adapter.initialize();
    adapter.processItem({
      name: 'custom',
      type: TelemetryType.Event,
      level: TelemetryLevel.Information,
      scope: ['app'],
      properties: { button: 'save' },
      metadata: { fusion: { type: 'app' } },
    });

    expect(client.trackEvent).toHaveBeenCalledWith({
      name: 'custom',
      properties: { button: 'save', metadata: { fusion: { type: 'app' } } },
    });
  });
});

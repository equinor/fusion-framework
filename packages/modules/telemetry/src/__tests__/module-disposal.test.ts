import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator, type ModuleEvent } from '@equinor/fusion-framework-module';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { enableTelemetry } from '../enable-telemetry.js';
import type { TelemetryModule } from '../module.js';
import { OtlpAdapter } from '../adapters/otlp/OtlpAdapter.js';
import { TelemetryLevel } from '../static.js';

afterEach(() => vi.restoreAllMocks());

describe('telemetry module disposal', () => {
  it('waits for buffered OTLP records to finish exporting before disposal completes', async () => {
    let completeExport: (() => void) | undefined;
    const send = vi
      .spyOn(OTLPLogExporter.prototype, 'export')
      .mockImplementation((_records, callback) => {
        completeExport = () => callback({ code: 0 });
      });
    const configurator = new ModulesConfigurator();
    const adapter = new OtlpAdapter({ url: 'http://localhost:4318/v1/logs' });
    enableTelemetry(configurator, {
      configure: (builder) => {
        builder.setAdapter('otlp', adapter);
        builder.setMetadata({});
      },
    });
    const modules = await configurator.initialize<[TelemetryModule]>();
    const completed = vi.fn();
    modules.telemetry.items.subscribe({ complete: completed });
    modules.telemetry.trackEvent({
      name: 'buffered before disposal',
      level: TelemetryLevel.Information,
      scope: ['app'],
    });
    expect(send).not.toHaveBeenCalled();

    const disposed = vi.fn();
    const disposal = configurator.dispose(modules).then(disposed);
    try {
      await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
      expect(completed).toHaveBeenCalledTimes(1);
      expect(disposed).not.toHaveBeenCalled();
      expect(send.mock.calls[0][0][0].body).toBe('buffered before disposal');
      expect(completeExport).toBeDefined();
    } finally {
      completeExport?.();
      await disposal;
    }
    expect(disposed).toHaveBeenCalledTimes(1);
  });

  it.each(['reject', 'throw'])(
    'reports a shutdown %s through the module lifecycle after attempting all adapters',
    async (failureMode) => {
      const failure = new Error('collector shutdown failed');
      const failingShutdown = vi.fn(() => {
        // Both asynchronous exporters and synchronously throwing custom adapters must be isolated.
        if (failureMode === 'throw') {
          throw failure;
        }
        return Promise.reject(failure);
      });
      const healthyShutdown = vi.fn().mockResolvedValue(undefined);
      const configurator = new ModulesConfigurator();
      enableTelemetry(configurator, {
        configure: (builder) => {
          builder.setAdapter('failing', {
            initialize: vi.fn(),
            processItem: vi.fn(),
            shutdown: failingShutdown,
          });
          builder.setAdapter('healthy', {
            initialize: vi.fn(),
            processItem: vi.fn(),
            shutdown: healthyShutdown,
          });
        },
      });
      const events: ModuleEvent[] = [];
      configurator.event$.subscribe((event) => events.push(event));
      const modules = await configurator.initialize<[TelemetryModule]>();

      await configurator.dispose(modules);
      expect(failingShutdown).toHaveBeenCalledTimes(1);
      expect(healthyShutdown).toHaveBeenCalledTimes(1);
      expect(events).toContainEqual(
        expect.objectContaining({
          properties: expect.objectContaining({ moduleName: 'telemetry' }),
          error: expect.objectContaining({
            errors: [
              expect.objectContaining({
                message: 'Failed to shut down telemetry adapter "failing"',
                cause: failure,
              }),
            ],
          }),
        }),
      );
    },
  );
});

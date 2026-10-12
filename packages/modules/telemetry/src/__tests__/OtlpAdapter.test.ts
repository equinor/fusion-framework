import { createServer } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { TelemetryLevel, TelemetryType } from '@equinor/fusion-framework-module-telemetry';
import { OtlpAdapter } from '../adapters/otlp/OtlpAdapter.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('OtlpAdapter', () => {
  it('delivers standard OTLP/HTTP JSON to a collector', async () => {
    let received: unknown;
    const server = createServer(async (request, response) => {
      const chunks: Buffer[] = [];
      // Reassemble the actual SDK request to verify its OTLP wire format.
      for await (const chunk of request) {
        chunks.push(Buffer.from(chunk));
      }
      received = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end('{}');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const address = server.address();
      // Use an ephemeral TCP collector without depending on external services.
      if (!address || typeof address === 'string') {
        throw new Error('Expected a TCP collector');
      }
      const adapter = new OtlpAdapter({ url: `http://127.0.0.1:${address.port}/v1/logs` });
      await adapter.initialize();
      adapter.processItem({
        name: 'collector log',
        scope: ['app'],
        level: TelemetryLevel.Information,
        type: TelemetryType.Event,
        metadata: { fusion: { app: { key: 'example-app' } } },
      });
      await adapter.forceFlush();
      await vi.waitFor(() =>
        expect(received).toMatchObject({
          resourceLogs: [
            {
              scopeLogs: [
                {
                  scope: { name: 'fusion.telemetry' },
                  logRecords: [
                    {
                      body: { stringValue: 'collector log' },
                      severityNumber: 9,
                      attributes: expect.arrayContaining([
                        { key: 'fusion.app.key', value: { stringValue: 'example-app' } },
                        { key: 'source', value: { stringValue: 'app' } },
                      ]),
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );
      await adapter.shutdown();
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      });
    }
  });

  it('uses the standard OTLP exporter with app key, source, and severity', async () => {
    const send = vi
      .spyOn(OTLPLogExporter.prototype, 'export')
      .mockImplementation((_records, callback) => {
        callback({ code: 0 });
      });
    const adapter = new OtlpAdapter({ url: 'http://localhost:4318/v1/logs', fallback: true });
    await adapter.initialize();
    expect(send).not.toHaveBeenCalled();
    adapter.processItem({
      name: 'app log',
      scope: ['app'],
      type: TelemetryType.Event,
      level: TelemetryLevel.Error,
      metadata: { fusion: { app: { key: 'example-app' } } },
    });
    await adapter.forceFlush();
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    const [record] = send.mock.calls[0][0];
    expect(record.body).toBe('app log');
    expect(record.severityNumber).toBe(17);
    expect(record.attributes).toMatchObject({
      'fusion.app.key': 'example-app',
      source: 'app',
    });
    expect(record.instrumentationScope.name).toBe('fusion.telemetry');
    expect(adapter.fallback).toBe(true);
    await adapter.shutdown();
  });

  it('reports exporter failures once without rejecting application work', async () => {
    const send = vi
      .spyOn(OTLPLogExporter.prototype, 'export')
      .mockImplementation((_records, callback) => {
        callback({ code: 1, error: new Error('offline') });
      });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const adapter = new OtlpAdapter({ url: 'http://localhost:4318/v1/logs' });
    await expect(adapter.initialize()).resolves.toBeUndefined();
    // Multiple exporter errors must remain best effort and report only once.
    for (let attempt = 0; attempt < 2; attempt++) {
      expect(() =>
        adapter.processItem({
          name: 'log',
          scope: ['app'],
          type: TelemetryType.Event,
          level: TelemetryLevel.Information,
        }),
      ).not.toThrow();
      await adapter.forceFlush();
    }
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(warning).toHaveBeenCalledTimes(1);
    await adapter.shutdown();
  });

  it('batches a startup burst without exceeding concurrent exporter requests', async () => {
    const send = vi
      .spyOn(OTLPLogExporter.prototype, 'export')
      .mockImplementation((_records, callback) => {
        setTimeout(() => callback({ code: 0 }), 10);
      });
    const adapter = new OtlpAdapter({ url: 'http://localhost:4318/v1/logs' });
    await adapter.initialize();
    // More than ten immediate records reproduced the browser export concurrency failure.
    for (let index = 0; index < 50; index++) {
      adapter.processItem({
        name: `startup_${index}`,
        scope: ['app'],
        type: TelemetryType.Event,
        level: TelemetryLevel.Information,
      });
    }
    expect(send).not.toHaveBeenCalled();
    await adapter.shutdown();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toHaveLength(50);
  });
});

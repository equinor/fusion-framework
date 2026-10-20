import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { telemetryExportRequest } from '@equinor/fusion-framework-module';
import { HttpClientExporterTransport } from '../logExporters/fusionOTLPLogExporter/HttpClientExporterTransport.js';

afterEach(() => vi.unstubAllGlobals());

describe('telemetry export request ownership', () => {
  it('identifies exports through the real client without marking simultaneous application requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}')),
    );
    const client = new HttpClient('https://business.test');
    const exported: boolean[] = [];
    client.middlewareHandler.use(async (uri, init, next) => {
      exported.push(telemetryExportRequest in init);
      expect(new Headers(init.headers).has('telemetry-export-request')).toBe(false);
      return next(uri, init);
    });
    const transport = new HttpClientExporterTransport(client, 'https://collector.test/v1/logs');
    const [result, response] = await Promise.all([
      transport.send(new Uint8Array(), 1_000),
      client.fetch('https://business.test/data'),
    ]);
    expect(result).toEqual({ status: 'success' });
    expect(response.ok).toBe(true);
    expect(exported).toEqual([true, false]);
  });
});

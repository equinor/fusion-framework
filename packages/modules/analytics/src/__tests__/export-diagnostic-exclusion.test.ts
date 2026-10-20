import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';
import { diagnosticExclusion } from '@equinor/fusion-framework-module';
import { HttpClientExporterTransport } from '../logExporters/fusionOTLPLogExporter/HttpClientExporterTransport.js';

afterEach(() => vi.unstubAllGlobals());

describe('exporter diagnostic exclusion', () => {
  it('preserves request-local exclusion through the real client without hiding simultaneous business requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}')),
    );
    const client = new HttpClient('https://business.test');
    const exported: boolean[] = [];
    client.middlewareHandler.use(async (uri, init, next) => {
      exported.push(diagnosticExclusion in init);
      expect(new Headers(init.headers).has('diagnostic-exclusion')).toBe(false);
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

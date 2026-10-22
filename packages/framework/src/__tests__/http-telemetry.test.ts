import { afterEach, describe, expect, it, vi } from 'vitest';
import { markTelemetryExportRequest } from '@equinor/fusion-framework-module';
import { enableTelemetry, type TelemetryItem } from '@equinor/fusion-framework-module-telemetry';
import { mockFramework } from '../mock/mock-framework.js';

const sentinel = 'privacy-sentinel-3f9c';

/** Starts a framework whose test adapter collects every exported operational HTTP record. */
const setup = async () => {
  const items: TelemetryItem[] = [];
  const fusion = await mockFramework((config) => {
    enableTelemetry(config, {
      configure: (builder) => {
        builder.setAdapter('test', {
          initialize: vi.fn(),
          processItem: (item: TelemetryItem) => {
            items.push(item);
          },
        });
      },
    });
    config.configureHttpClient('remote', { baseUri: `https://${sentinel}.example.com` });
    // Application retry middleware registered by configuration wraps the instrumentation.
    config.http.addMiddleware(async (uri, init, next) => {
      const response = await next(uri, init);
      return response.status === 503 ? next(uri, init) : response;
    });
  });
  return {
    fusion,
    http: () => items.filter((item) => item.name.startsWith('fusion.http.request.')),
  };
};

describe('framework HTTP telemetry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('records each retried transport attempt once, with one sanitized failure', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(sentinel, { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sentinel }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const { fusion, http } = await setup();
    const client = fusion.modules.http.createClient('remote');

    const response = await client.fetch(`/items?token=${sentinel}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${sentinel}` },
      body: sentinel,
    });

    // The business response is returned unchanged after the retry.
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sentinel });
    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.waitFor(() => expect(http()).toHaveLength(3));
    const durations = http().filter((item) => item.name === 'fusion.http.request.duration');
    expect(durations.map((item) => item.diagnostic?.outcome)).toEqual(['failure', 'success']);
    expect(http().filter((item) => item.name === 'fusion.http.request.failure')).toHaveLength(1);
    expect(durations[0].diagnostic).toMatchObject({ source: 'framework', module: 'http' });
    expect(JSON.stringify(http())).not.toContain(sentinel);
    await fusion.modules.dispose();
  });

  it('classifies an aborted request as cancelled and rethrows the original error', async () => {
    const abort = new DOMException('aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    const { fusion, http } = await setup();
    const controller = new AbortController();
    controller.abort();

    await expect(
      fusion.modules.http.createClient('remote').fetch('/items', { signal: controller.signal }),
    ).rejects.toBe(abort);

    await vi.waitFor(() => expect(http()).toHaveLength(1));
    expect(http()[0]).toMatchObject({
      name: 'fusion.http.request.duration',
      diagnostic: { outcome: 'cancelled' },
    });
    await fusion.modules.dispose();
  });

  it('excludes exporter-owned requests and stops recording after disposal', async () => {
    const fetch = vi.fn(async () => new Response('ok'));
    vi.stubGlobal('fetch', fetch);
    const { fusion, http } = await setup();
    const client = fusion.modules.http.createClient('remote');

    await client.fetch('/v1/logs', markTelemetryExportRequest({ method: 'POST' }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(http()).toHaveLength(0);

    await fusion.modules.dispose();
    await client.fetch('/after-dispose');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(http()).toHaveLength(0);
  });
});

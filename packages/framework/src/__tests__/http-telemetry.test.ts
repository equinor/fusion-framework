import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  markTelemetryExportRequest,
  telemetryExportRequest,
} from '@equinor/fusion-framework-module';
import { enableTelemetry, type TelemetryItem } from '@equinor/fusion-framework-module-telemetry';
import { mockFramework } from '../mock/mock-framework.js';

const sentinel = 'privacy-sentinel-3f9c';

/** Retries once on 503, standing in for application retry middleware. */
const retry = async (
  uri: string,
  init: RequestInit,
  next: (uri: string, init: RequestInit) => Promise<Response>,
): Promise<Response> => {
  const response = await next(uri, init);
  return response.status === 503 ? next(uri, init) : response;
};

/**
 * Starts a framework whose test adapter collects every exported operational HTTP record.
 * @param register - Where the application registers its retry middleware.
 */
const setup = async (register: 'configure' | 'async-on-configured' = 'configure') => {
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
    config.configureHttpClient('secured', {
      baseUri: `https://${sentinel}.example.com`,
      defaultScopes: ['api://telemetry/.default'],
    });
    // Application retry middleware wraps the instrumentation wherever it is registered.
    if (register === 'configure') {
      config.http.addMiddleware(retry);
    } else {
      config.onConfigured(async (configs) => {
        // Settling later than the framework's own callbacks must not change the order.
        await new Promise((resolve) => setTimeout(resolve, 0));
        configs.http.addMiddleware(retry);
      });
    }
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

  it('keeps telemetry innermost when retry middleware is added by a later async callback', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const { fusion, http } = await setup('async-on-configured');

    await fusion.modules.http.createClient('remote').fetch('/items');

    expect(fetch).toHaveBeenCalledTimes(2);
    await vi.waitFor(() =>
      expect(
        http()
          .filter((item) => item.name === 'fusion.http.request.duration')
          .map((item) => item.diagnostic?.outcome),
      ).toEqual(['failure', 'success']),
    );
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

  it('forwards the export marker to token acquisition for authenticated exports only', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('ok')),
    );
    const { fusion } = await setup();
    const acquire = vi.spyOn(fusion.modules.auth, 'acquireAccessToken');
    const client = fusion.modules.http.createClient('secured');

    await client.fetch('/v1/logs', markTelemetryExportRequest({ method: 'POST' }));
    await client.fetch('/items');

    expect(acquire).toHaveBeenCalledTimes(2);
    const [exported, application] = acquire.mock.calls.map(([options]) => options as object);
    // Only the exporter's token request is owned by telemetry delivery.
    expect(telemetryExportRequest in exported).toBe(true);
    expect(telemetryExportRequest in application).toBe(false);
    expect(exported).toMatchObject({ request: { scopes: ['api://telemetry/.default'] } });
    await fusion.modules.dispose();
  });
});

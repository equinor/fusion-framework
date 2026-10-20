import { afterEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { markTelemetryExportRequest } from '@equinor/fusion-framework-module';
import { TelemetryProvider } from '../TelemetryProvider.js';
import { createHttpTelemetry } from '../integrations/create-http-telemetry.js';
import {
  observeQueryTelemetry,
  type QueryDiagnosticEvent,
} from '../integrations/observe-query-telemetry.js';

afterEach(() => vi.restoreAllMocks());

describe('optional shared telemetry integration', () => {
  it('preserves HTTP results and excludes export requests without hiding concurrent business requests', async () => {
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await provider.initialize();
    const diagnostics = createHttpTelemetry(() => provider);
    const response = new Response('secret response');
    const next = vi.fn(async () => response);
    const results = await Promise.all([
      diagnostics.middleware(
        'https://secret?token=sentinel',
        markTelemetryExportRequest({ method: 'POST' }),
        next,
      ),
      diagnostics.middleware('https://secret?token=sentinel', { body: 'secret body' }, next),
    ]);
    expect(results).toEqual([response, response]);
    expect(processItem).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('secret');
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('sentinel');
    diagnostics.dispose();
    await diagnostics.middleware('/after-dispose', {}, next);
    expect(processItem).toHaveBeenCalledTimes(1);
    await provider.dispose();
  });

  it('preserves HTTP failure and cancellation while a custom telemetry provider throws', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new TelemetryProvider({});
    await provider.initialize();
    vi.spyOn(provider, 'track').mockImplementation(() => {
      throw new Error('secret exporter');
    });
    const diagnostics = createHttpTelemetry(() => provider);
    const failure = new Error('original business failure');
    const next = vi.fn(async (): Promise<Response> => {
      throw failure;
    });
    await expect(diagnostics.middleware('/secret', {}, next)).rejects.toBe(failure);
    const abort = new AbortController();
    abort.abort();
    await expect(diagnostics.middleware('/secret', { signal: abort.signal }, next)).rejects.toBe(
      failure,
    );
    expect(warning).toHaveBeenCalledTimes(1);
    await provider.dispose();
  });

  it('records an HTTP error response and cancellation separately without consuming the body', async () => {
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await provider.initialize();
    const diagnostics = createHttpTelemetry(() => provider);
    const response = new Response('sentinel', { status: 500 });
    expect(await diagnostics.middleware('/secret', {}, async () => response)).toBe(response);
    expect(response.bodyUsed).toBe(false);
    const abort = new AbortController();
    abort.abort();
    const failure = new Error('sentinel');
    await expect(
      diagnostics.middleware('/secret', { signal: abort.signal }, async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);
    expect(processItem.mock.calls.map(([item]) => item.diagnostic.outcome)).toEqual([
      'failure',
      'failure',
      'cancelled',
    ]);
    await provider.dispose();
  });

  it('observes one terminal query outcome per transaction without exporting the transaction or payload', async () => {
    const events = new Subject<QueryDiagnosticEvent & { data?: unknown }>();
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await provider.initialize();
    const subscription = observeQueryTelemetry(events, () => provider);
    for (const type of [
      'query_client_job_requested',
      'query_client_job_executing',
      'query_client_job_completed',
      'query_client_job_error',
    ]) {
      events.next({ type, transaction: 'secret-cache-key', data: { token: 'secret-token' } });
    }
    expect(processItem.mock.calls.map(([item]) => item.name)).toEqual([
      'fusion.query.schedule.duration',
      'fusion.query.execute.duration',
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('secret');
    events.next({ type: 'query_client_job_requested', transaction: 'cancel' });
    events.next({ type: 'query_client_job_canceled', transaction: 'cancel' });
    expect(processItem.mock.calls[2][0]).toMatchObject({
      name: 'fusion.query.schedule.duration',
      diagnostic: { outcome: 'cancelled' },
    });
    subscription?.unsubscribe();
    expect(events.observed).toBe(false);
    await provider.dispose();
  });

  it('reports cache notifications without inventing lookup durations or exposing cache data', async () => {
    const events = new Subject<QueryDiagnosticEvent & { key?: string; data?: unknown }>();
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await provider.initialize();
    const subscription = observeQueryTelemetry(events, () => provider);
    events.next({ type: 'query_cache_hit', key: 'sentinel-key', data: { token: 'sentinel' } });
    events.next({ type: 'query_cache_miss', key: 'sentinel-key' });
    expect(processItem.mock.calls.map(([item]) => item.name)).toEqual([
      'fusion.query.cache-hit',
      'fusion.query.cache-miss',
    ]);
    expect(processItem.mock.calls.every(([item]) => !('value' in item))).toBe(true);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('sentinel');
    subscription?.unsubscribe();
    await provider.dispose();
  });

  it('does not subscribe to queries or alter HTTP when telemetry is absent', async () => {
    const events = new Subject<QueryDiagnosticEvent>();
    expect(observeQueryTelemetry(events, () => undefined)).toBeUndefined();
    expect(events.observed).toBe(false);
    const diagnostics = createHttpTelemetry(() => undefined);
    const response = new Response();
    expect(await diagnostics.middleware('/business', {}, async () => response)).toBe(response);
  });
});

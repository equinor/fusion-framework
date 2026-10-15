import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { from, switchMap, type Observable } from 'rxjs';
import type { IHttpClient } from '@equinor/fusion-framework-module-http';

import { ServiceDiscoveryClient } from '../client';
import { ServiceDiscoveryUnavailableError } from '../ServiceDiscoveryUnavailableError';
import type { Service } from '../types';

const services: Service[] = [
  {
    key: 'people',
    uri: 'https://people.test',
    scopes: ['people/.default'],
    defaultScopes: ['people/.default'],
  },
];

const okResponse = (): Response =>
  new Response(JSON.stringify(services), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const unauthorizedResponse = (): Response =>
  new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });

/**
 * Creates a fake http client whose `fetch$` runs the real selector against the next
 * queued response, so failures surface exactly like the production http module.
 */
const createHttp = (
  ...responses: Array<() => Response>
): { http: IHttpClient; fetch$: ReturnType<typeof vi.fn> } => {
  const queue = [...responses];
  const fetch$ = vi.fn(
    (_path: string, init: { selector: (res: Response) => Observable<unknown> }) =>
      from(Promise.resolve()).pipe(
        switchMap(() => {
          // Keep replaying the last queued response once the queue is drained
          const next = queue.length > 1 ? queue.shift() : queue[0];
          // Guard against tests that forget to queue a response
          if (!next) throw new Error('no response queued');
          return from(init.selector(next()));
        }),
      ),
  );
  return { http: { fetch$ } as unknown as IHttpClient, fetch$ };
};

const createClient = (http: IHttpClient): ServiceDiscoveryClient =>
  new ServiceDiscoveryClient({ http, endpoint: '/services' });

const advance = (ms: number): void => {
  vi.setSystemTime(Date.now() + ms);
};

describe('ServiceDiscoveryClient resilience', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    // Pin jitter to its upper bound so backoff delays are exact
    vi.spyOn(Math, 'random').mockReturnValue(1);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves services and serves repeat calls from the 5 minute cache', async () => {
    const { http, fetch$ } = createHttp(okResponse);
    const client = createClient(http);

    await expect(client.resolveServices()).resolves.toEqual(services);
    await expect(client.resolveService('people')).resolves.toMatchObject({ key: 'people' });
    expect(fetch$).toHaveBeenCalledTimes(1);
  });

  it('rethrows the original error, then fails fast without network calls during the cooldown', async () => {
    const { http, fetch$ } = createHttp(unauthorizedResponse);
    const client = createClient(http);

    const original = await client.resolveServices().catch((error: unknown) => error);
    expect(original).not.toBeInstanceOf(ServiceDiscoveryUnavailableError);
    expect(original).toMatchObject({ response: { status: 401 } });

    // Simulates a retry loop: none of these calls may reach the network
    for (let i = 0; i < 50; i++) {
      await expect(client.resolveServices()).rejects.toBeInstanceOf(
        ServiceDiscoveryUnavailableError,
      );
    }
    expect(fetch$).toHaveBeenCalledTimes(1);

    const paused = await client.resolveService('people').catch((error: unknown) => error);
    expect(paused).toBeInstanceOf(ServiceDiscoveryUnavailableError);
    expect((paused as ServiceDiscoveryUnavailableError).cause).toBe(original);
    expect((paused as ServiceDiscoveryUnavailableError).attempt).toBe(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('doubles the cooldown on consecutive failures and caps it at 30 seconds', async () => {
    const { http, fetch$ } = createHttp(unauthorizedResponse);
    const client = createClient(http);

    const delays = [1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000];
    // Each failure doubles the cooldown until it hits the 30 second cap
    for (const expectedDelay of delays) {
      await expect(client.resolveServices()).rejects.toBeDefined();
      const calls = fetch$.mock.calls.length;

      advance(expectedDelay - 1);
      await expect(client.resolveServices()).rejects.toBeInstanceOf(
        ServiceDiscoveryUnavailableError,
      );
      expect(fetch$).toHaveBeenCalledTimes(calls);

      advance(1);
    }
    expect(fetch$).toHaveBeenCalledTimes(delays.length);
    // one warning for the whole streak, not one per failure
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it('resets the backoff after a successful request', async () => {
    const { http, fetch$ } = createHttp(unauthorizedResponse, okResponse, unauthorizedResponse);
    const client = createClient(http);

    await expect(client.resolveServices()).rejects.toBeDefined();
    advance(1_000);
    await expect(client.resolveServices()).resolves.toEqual(services);

    // expire the 5 minute query cache so the next call refetches, fails, and falls back
    advance(5 * 60 * 1_000 + 1);
    await expect(client.resolveServices()).resolves.toEqual(services);
    expect(fetch$).toHaveBeenCalledTimes(3);

    // a reset streak means a 1s cooldown again, not 2s
    advance(999);
    await client.resolveServices();
    expect(fetch$).toHaveBeenCalledTimes(3);
    advance(1);
    await client.resolveServices();
    expect(fetch$).toHaveBeenCalledTimes(4);
  });

  it('returns the last known service list when a refresh fails and during the cooldown', async () => {
    const { http, fetch$ } = createHttp(okResponse, unauthorizedResponse);
    const client = createClient(http);

    await expect(client.resolveServices()).resolves.toEqual(services);

    advance(5 * 60 * 1_000 + 1);
    await expect(client.resolveServices()).resolves.toEqual(services);
    await expect(client.resolveService('people')).resolves.toMatchObject({ key: 'people' });
    expect(fetch$).toHaveBeenCalledTimes(2);
  });

  it('surfaces the failure when the last known service list is older than 24 hours', async () => {
    const { http } = createHttp(okResponse, unauthorizedResponse);
    const client = createClient(http);

    await client.resolveServices();
    advance(24 * 60 * 60 * 1_000 + 1);

    await expect(client.resolveServices()).rejects.toMatchObject({ response: { status: 401 } });
  });

  it('counts concurrent callers sharing one failed request as a single failure', async () => {
    const { http, fetch$ } = createHttp(unauthorizedResponse);
    const client = createClient(http);

    const results = await Promise.allSettled([
      client.resolveServices(),
      client.resolveServices(),
      client.resolveService('people'),
    ]);
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(fetch$).toHaveBeenCalledTimes(1);

    // a single failure means a 1s cooldown, not 4s
    advance(1_000);
    await expect(client.resolveServices()).rejects.not.toBeInstanceOf(
      ServiceDiscoveryUnavailableError,
    );
    expect(fetch$).toHaveBeenCalledTimes(2);
  });
});

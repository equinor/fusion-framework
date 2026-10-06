import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createMockAnalytics,
  createMockAuth,
  createMockServer,
  type MockAnalyticsRequestClient,
  type MockServerHandle,
} from '../../index.js';
import { defineService } from '../../discovery/define-service.js';
import { defineAnalyticsMock } from '../../presets/fusion/index.js';

/** A fetch-based stand-in for Playwright's `context.request`, with its own cookie jar. */
interface TestRequestClient extends MockAnalyticsRequestClient {
  put(url: string, options: { data: unknown }): Promise<TestResponse>;
  post(
    url: string,
    options: { data: unknown; headers?: Record<string, string> },
  ): Promise<TestResponse>;
}

interface TestResponse {
  ok(): boolean;
  status(): number;
  json(): Promise<unknown>;
}

/** Creates a request client that keeps the mock-auth cookie, like one Playwright browser context. */
function createRequestClient(): TestRequestClient {
  let cookie: string | undefined;
  const send = async (url: string, method: string, data?: unknown, headers = {}) => {
    const response = await fetch(url, {
      method,
      headers: {
        ...(data === undefined ? {} : { 'content-type': 'application/json' }),
        ...(cookie ? { cookie } : {}),
        ...headers,
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    cookie = response.headers.getSetCookie()[0]?.split(';')[0] ?? cookie;
    const body: unknown = await response.json().catch(() => undefined);
    return { ok: () => response.ok, status: () => response.status, json: async () => body };
  };
  return {
    get: (url) => send(url, 'GET'),
    delete: (url) => send(url, 'DELETE'),
    put: (url, { data }) => send(url, 'PUT', data),
    post: (url, { data, headers }) => send(url, 'POST', data, headers),
  };
}

/** One `ResourceLogs` entry with one app-feature event. */
const resourceLog = (feature: string, appKey = 'my-app') => ({
  scopeLogs: [
    {
      logRecords: [
        {
          timeUnixNano: `${Date.now()}000000`,
          eventName: 'app-feature',
          body: {
            kvlistValue: {
              values: [
                { key: 'feature', value: { stringValue: feature } },
                {
                  key: 'data',
                  value: { kvlistValue: { values: [{ key: 'n', value: { intValue: 1 } }] } },
                },
              ],
            },
          },
          attributes: [{ key: 'appKey', value: { stringValue: appKey } }],
        },
      ],
    },
  ],
});

/** The framework MSAL mock's startup token, used by a browser without a selected mock user. */
const startupToken = [
  Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ oid: 'fusion-mock-user' })).toString('base64url'),
  'fusion-test-signature',
].join('.');

describe('analytics control and createMockAnalytics', () => {
  let server: MockServerHandle | undefined;
  let dir: string | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
    if (dir) await rm(dir, { recursive: true, force: true });
    dir = undefined;
  });

  /** Starts a server with the analytics mock. */
  async function start(options: Parameters<typeof defineAnalyticsMock>[0] = {}) {
    server = createMockServer().use([defineAnalyticsMock({ warn: () => undefined, ...options })]);
    const { url } = await server.start();
    return url;
  }

  /** Signs a browser context in and sends events from it, as the app would. */
  async function signInAndTrack(url: string, userId: string, features: string[]) {
    const request = createRequestClient();
    await createMockAuth(url).setUser(request, { userId });
    const tokenResponse = await request.post(`${url}/@fusion-mock/auth/token`, {
      data: { scopes: ['monitor/.default'] },
    });
    const { token } = (await tokenResponse.json()) as { token: string };
    const track = async (feature: string) => {
      const response = await request.post(`${url}/monitor/v1/logs`, {
        data: { resourceLogs: [resourceLog(feature)] },
        headers: { authorization: `Bearer ${token}` },
      });
      expect(response.status()).toBe(202);
    };
    for (const feature of features) await track(feature);
    return { request, track };
  }

  it('lists only the caller session events, narrowed by filters', async () => {
    const url = await start();
    const analytics = createMockAnalytics(url);
    const one = await signInAndTrack(url, 'one', ['page-viewed', 'demand-created']);
    await signInAndTrack(url, 'two', ['page-viewed']);

    expect((await analytics.list(one.request)).map((event) => event.user_id)).toEqual([
      'one',
      'one',
    ]);
    expect(await analytics.list(one.request, { feature: 'demand-created' })).toEqual([
      expect.objectContaining({ data_feature: 'demand-created', data_body_data: '{"n":1}' }),
    ]);
    expect(await analytics.list(one.request, { appKey: 'other' })).toEqual([]);
    expect(await analytics.list(one.request, { eventName: 'app-loaded' })).toEqual([]);
    expect(await analytics.list(createRequestClient())).toHaveLength(3);
  });

  it('waits for an event that arrives after the wait starts', async () => {
    const url = await start();
    const analytics = createMockAnalytics(url);
    const { request, track } = await signInAndTrack(url, 'tester', []);

    const waiting = analytics.waitFor(request, { feature: 'later', interval: 20 });
    setTimeout(() => void track('later'), 100);

    expect(await waiting).toMatchObject({ data_feature: 'later', user_id: 'tester' });
  });

  it('uses the match function to check event data', async () => {
    const url = await start();
    const analytics = createMockAnalytics(url);
    const { request } = await signInAndTrack(url, 'tester', ['a', 'b']);

    const event = await analytics.waitFor(request, {
      match: (candidate) => 'data_feature' in candidate && candidate.data_feature === 'b',
    });

    expect(event).toMatchObject({ data_feature: 'b' });
  });

  it('fails a wait with a clear message when no event matches in time', async () => {
    const url = await start();
    const analytics = createMockAnalytics(url);
    const { request } = await signInAndTrack(url, 'tester', ['page-viewed']);

    await expect(
      analytics.waitFor(request, { feature: 'never', timeout: 150, interval: 20 }),
    ).rejects.toThrow(
      'Timed out after 150ms waiting for an analytics event matching {"feature":"never"}. Received 1 event(s): page-viewed.',
    );
  });

  it('resets only the caller session and keeps seeded history', async () => {
    dir = await mkdtemp(join(tmpdir(), 'analytics-control-'));
    const seed = join(dir, 'seed.jsonl');
    await writeFile(seed, `${JSON.stringify(resourceLog('seeded'))}\n`);
    const url = await start({ seed });
    const analytics = createMockAnalytics(url);
    const one = await signInAndTrack(url, 'one', ['a']);
    const two = await signInAndTrack(url, 'two', ['b']);

    await analytics.reset(one.request);

    expect(await analytics.list(one.request)).toEqual([]);
    expect(await analytics.list(two.request)).toHaveLength(1);
    const withSeed = await one.request.get(`${url}/@fusion-mock/analytics?includeSeeded=true`);
    expect(((await withSeed.json()) as { events: unknown[] }).events).toEqual([
      expect.objectContaining({ data_feature: 'seeded' }),
    ]);
  });

  it('reads the local-development session of a browser without a selected user', async () => {
    const url = await start();
    const analytics = createMockAnalytics(url);
    await fetch(`${url}/monitor/v1/logs`, {
      method: 'POST',
      headers: { authorization: `Bearer ${startupToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ resourceLogs: [resourceLog('local')] }),
    });
    await signInAndTrack(url, 'other', ['elsewhere']);

    const events = await analytics.list(createRequestClient(), { session: 'local-development' });

    expect(events).toEqual([
      expect.objectContaining({ data_feature: 'local', user_id: 'fusion-mock-user' }),
    ]);
  });

  it('rejects unsupported methods', async () => {
    const url = await start();

    const response = await fetch(`${url}/@fusion-mock/analytics`, { method: 'PUT' });

    expect(response.status).toBe(405);
  });

  it('explains when the mock server does not serve analytics', async () => {
    server = createMockServer().use([]);
    const { url } = await server.start();

    await expect(createMockAnalytics(url).list(createRequestClient())).rejects.toThrow(
      'Failed to read analytics: the mock server does not serve analytics',
    );
  });
});

describe('service control routes', () => {
  it('keeps /@fusion-mock/analytics when a local monitor merge layer adds its own control route', async () => {
    const monitor = defineAnalyticsMock({ warn: () => undefined });
    const server = createMockServer()
      .use([monitor])
      .use([
        defineService({
          key: 'monitor',
          serviceDiscovery: 'merge',
          control: { 'monitor-info': () => ({ status: 200, body: { local: true } }) },
        }),
      ]);
    const { url } = await server.start();
    try {
      expect((await fetch(`${url}/@fusion-mock/analytics`)).status).toBe(200);
      expect(await (await fetch(`${url}/@fusion-mock/monitor-info`)).json()).toEqual({
        local: true,
      });
    } finally {
      await server.close();
    }
  });

  let server: MockServerHandle | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  const schema = {
    openapi: '3.0.0',
    info: { title: 'S', version: '1' },
    paths: {
      '/state': { get: { operationId: 'state', responses: { 200: { description: 'ok' } } } },
    },
  };

  it('routes /@fusion-mock/<name> to a service handler but never reserved names', async () => {
    server = createMockServer().use([
      defineService({
        key: 'demo',
        serviceDiscovery: 'replace',
        schema,
        control: {
          state: ({ method, query }) => ({ status: 200, body: { method, q: query.get('q') } }),
          health: () => ({ status: 418 }),
        },
      }),
    ]);
    const { url } = await server.start();

    const state = await fetch(`${url}/@fusion-mock/state?q=1`, { method: 'DELETE' });
    expect(await state.json()).toEqual({ method: 'DELETE', q: '1' });
    expect((await fetch(`${url}/@fusion-mock/health`, { method: 'POST' })).status).toBe(404);
    expect((await fetch(`${url}/@fusion-mock/constructor`)).status).toBe(404);
    // Two segments still mean a per-operation override, not a control route.
    const override = await fetch(`${url}/@fusion-mock/demo/state`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mock: {} }),
    });
    expect(override.status).toBe(200);
  });
});

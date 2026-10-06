import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockServer, type MockServerHandle } from '../../index.js';
import {
  AnalyticsStore,
  defineAnalyticsMock,
  readAnalyticsRecordings,
} from '../../presets/fusion/index.js';
import { readStartupMockUserId } from '../../presets/fusion/analytics/identity/index.js';

interface MockSession {
  token: string;
  sessionId: string;
}

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** The framework MSAL mock's startup token shape: unsigned, with its fixed signature segment. */
const startupToken = (oid = 'fusion-mock-user') =>
  `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ oid })}.fusion-test-signature`;

/** One `ResourceLogs` entry as the framework analytics adapter sends it. */
const resourceLog = (feature: string, data?: Record<string, string>) => ({
  resource: {
    attributes: [
      { key: 'module.version', value: { stringValue: '3.0.8' } },
      { key: 'session.id', value: { stringValue: 'adapter-session' } },
      { key: 'portal.id', value: { stringValue: 'fusion' } },
    ],
  },
  scopeLogs: [
    {
      scope: { name: 'fusion' },
      logRecords: [
        {
          timeUnixNano: `${Date.parse('2026-10-05T10:00:00Z')}000000`,
          severityNumber: 9,
          eventName: 'app-feature',
          body: {
            kvlistValue: {
              values: [
                { key: 'feature', value: { stringValue: feature } },
                {
                  key: 'data',
                  value: data
                    ? {
                        kvlistValue: {
                          values: Object.entries(data).map(([key, stringValue]) => ({
                            key,
                            value: { stringValue },
                          })),
                        },
                      }
                    : {},
                },
              ],
            },
          },
          attributes: [{ key: 'appKey', value: { stringValue: 'my-app' } }],
        },
      ],
    },
  ],
});

/**
 * Selects a mock-auth user and acquires a session-scoped token, as a Playwright test does.
 *
 * @param url - Running mock server origin.
 * @param userId - Mock user to select.
 * @returns The bearer token and its browser session id.
 */
async function signIn(url: string, userId: string): Promise<MockSession> {
  const selection = await fetch(`${url}/@fusion-mock/auth/user`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const cookie = selection.headers.getSetCookie()[0]?.split(';')[0] ?? '';
  const response = await fetch(`${url}/@fusion-mock/auth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ scopes: ['monitor/.default'] }),
  });
  const { token } = (await response.json()) as { token: string };
  const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
    sid: string;
  };
  return { token, sessionId: claims.sid };
}

/**
 * Posts a body to the mock Monitor service.
 *
 * @param url - Running mock server origin.
 * @param body - Raw body text.
 * @param headers - Request headers.
 * @returns The response.
 */
function postLogs(url: string, body: string, headers: Record<string, string>): Promise<Response> {
  return fetch(`${url}/monitor/v1/logs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

describe('defineAnalyticsMock', () => {
  let server: MockServerHandle | undefined;
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'analytics-mock-'));
  });

  afterEach(async () => {
    await server?.close();
    server = undefined;
    await rm(dir, { recursive: true, force: true });
  });

  /** Starts a mock server with the analytics mock and returns its URL and store. */
  async function start(options: Parameters<typeof defineAnalyticsMock>[0] = {}) {
    const definition = defineAnalyticsMock({ warn: () => undefined, ...options });
    server = createMockServer().use([definition]);
    const { url } = await server.start();
    return { url, store: definition.store };
  }

  it('accepts a batch with 202 and reads its events right away', async () => {
    const { url, store } = await start();
    const session = await signIn(url, 'tester');

    const response = await postLogs(
      url,
      JSON.stringify({ resourceLogs: [resourceLog('page-viewed', { route: '/' })] }),
      { authorization: `Bearer ${session.token}` },
    );

    expect(response.status).toBe(202);
    expect(store.getRows(session.sessionId)).toEqual([
      expect.objectContaining({
        event_name: 'app-feature',
        user_id: 'tester',
        session_id: 'adapter-session',
        data_appkey: 'my-app',
        data_feature: 'page-viewed',
        data_body_data: '{"route":"/"}',
        _source_file: 'mock://monitor/v1/logs',
      }),
    ]);
  });

  it('advertises the monitor service with a scope so the framework sends a token', async () => {
    const { url } = await start();

    const discovery = (await (await fetch(`${url}/@fusion-mock/discovery`)).json()) as unknown[];

    expect(discovery).toContainEqual(
      expect.objectContaining({ key: 'monitor', scopes: ['monitor/.default'] }),
    );
  });

  it.each([
    ['no log entries', JSON.stringify({ resourceLogs: [] }), 'InvalidOperation'],
    ['no resourceLogs list', JSON.stringify({}), 'InvalidOperation'],
    ['an empty body', '', 'Invalid json'],
    ['entries that are not objects', JSON.stringify({ resourceLogs: ['x'] }), 'Invalid json'],
    ['invalid JSON', '{"resourceLogs": [', 'InvalidJson'],
  ])('answers 400 for %s, as the Monitor service does', async (_case, body, code) => {
    const { url, store } = await start();
    const session = await signIn(url, 'tester');

    const response = await postLogs(url, body, { authorization: `Bearer ${session.token}` });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code } });
    expect(store.getRecords()).toEqual([]);
  });

  it('answers 400 for JSON nested deeper than 64 levels', async () => {
    const { url } = await start();
    const session = await signIn(url, 'tester');
    const deep = `${'['.repeat(64)}${']'.repeat(64)}`;

    const response = await postLogs(url, `{"resourceLogs":[{"x":${deep}}]}`, {
      authorization: `Bearer ${session.token}`,
    });

    expect(response.status).toBe(400);
  });

  it.each([
    ['no token', {}],
    ['a token the mock server did not issue', { authorization: 'Bearer a.b.c' }],
  ])('answers 401 for %s', async (_case, headers) => {
    const { url } = await start();

    const response = await postLogs(
      url,
      JSON.stringify({ resourceLogs: [resourceLog('x')] }),
      headers,
    );

    expect(response.status).toBe(401);
  });

  it.each([
    ['a JSON body', JSON.stringify({ resourceLogs: [resourceLog('x')] })],
    ['a body that is not JSON', 'hello'],
  ])('answers 415 for %s not declared as JSON', async (_case, body) => {
    const { url } = await start();
    const session = await signIn(url, 'tester');

    const response = await postLogs(url, body, {
      authorization: `Bearer ${session.token}`,
      'content-type': 'text/plain',
    });

    expect(response.status).toBe(415);
  });

  it('accepts the MSAL mock startup identity as the local-development session', async () => {
    const { url, store } = await start();

    const response = await postLogs(url, JSON.stringify({ resourceLogs: [resourceLog('x')] }), {
      authorization: `Bearer ${startupToken()}`,
    });

    expect(response.status).toBe(202);
    expect(store.getRecords('local-development')).toEqual([
      expect.objectContaining({ user_id: 'fusion-mock-user' }),
    ]);
  });

  it('keeps the events of each browser session apart', async () => {
    const { url, store } = await start();
    const [first, second] = await Promise.all([signIn(url, 'one'), signIn(url, 'two')]);

    await postLogs(url, JSON.stringify({ resourceLogs: [resourceLog('a')] }), {
      authorization: `Bearer ${first.token}`,
    });
    await postLogs(url, JSON.stringify({ resourceLogs: [resourceLog('b')] }), {
      authorization: `Bearer ${second.token}`,
    });

    expect(store.getRows(first.sessionId)).toEqual([
      expect.objectContaining({ data_feature: 'a', user_id: 'one' }),
    ]);
    expect(store.getRows(second.sessionId)).toEqual([
      expect.objectContaining({ data_feature: 'b', user_id: 'two' }),
    ]);
    expect(store.getRows()).toHaveLength(2);
  });

  it('appends one line per entry, with the user id, to the recording', async () => {
    const record = join(dir, 'nested', 'analytics.jsonl');
    const { url, store } = await start({ record });
    const session = await signIn(url, 'tester');

    await postLogs(url, JSON.stringify({ resourceLogs: [resourceLog('a'), resourceLog('b')] }), {
      authorization: `Bearer ${session.token}`,
    });
    await postLogs(url, JSON.stringify({ resourceLogs: [resourceLog('c')] }), {
      authorization: `Bearer ${session.token}`,
    });

    const lines = (await readFile(record, 'utf8')).trimEnd().split('\n');
    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0]).resource.attributes).toContainEqual({
      key: 'user.id',
      value: { stringValue: 'tester' },
    });
    expect(store.getRecords()[0]._source_file).toBe(record);
  });

  it('loads a recording from an earlier run as seed, and keeps it on reset', async () => {
    const record = join(dir, 'analytics.jsonl');
    const first = await start({ record });
    const session = await signIn(first.url, 'tester');
    await postLogs(first.url, JSON.stringify({ resourceLogs: [resourceLog('earlier')] }), {
      authorization: `Bearer ${session.token}`,
    });
    await server?.close();

    const { url, store } = await start({ seed: record });
    const next = await signIn(url, 'tester');
    await postLogs(url, JSON.stringify({ resourceLogs: [resourceLog('now')] }), {
      authorization: `Bearer ${next.token}`,
    });
    expect(store.getRows(next.sessionId)).toEqual([
      expect.objectContaining({ data_feature: 'earlier', user_id: 'tester' }),
      expect.objectContaining({ data_feature: 'now' }),
    ]);

    await fetch(`${url}/@fusion-mock/reset`, { method: 'POST' });

    expect(store.getRows()).toEqual([expect.objectContaining({ data_feature: 'earlier' })]);
  });
});

describe('readAnalyticsRecordings', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'analytics-recordings-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reads gzipped landing-zone files in folders, in path order', async () => {
    const hour = join(dir, 'year=2026', 'month=10', 'day=05');
    await mkdir(join(hour, 'hour=10'), { recursive: true });
    await mkdir(join(hour, 'hour=11'), { recursive: true });
    await writeFile(
      join(hour, 'hour=11', 'logs_20261005110000.json.gz'),
      gzipSync(`${JSON.stringify(resourceLog('second'))}\n`),
    );
    await writeFile(
      join(hour, 'hour=10', 'logs_20261005100000.json.gz'),
      gzipSync(`${JSON.stringify(resourceLog('first'))}\n`),
    );
    await writeFile(join(hour, 'notes.txt'), 'ignored');

    const { records, issues } = await readAnalyticsRecordings([dir]);

    expect(issues).toEqual([]);
    expect(records.map((record) => record.data_body)).toEqual([
      '{"feature": "first", "data": null}',
      '{"feature": "second", "data": null}',
    ]);
    expect(records[0]._source_file).toMatch(/logs_20261005100000\.json\.gz$/);
  });

  it('reports broken lines with their file and line, and reads the rest', async () => {
    const file = join(dir, 'analytics.jsonl');
    await writeFile(
      file,
      [
        JSON.stringify(resourceLog('a')),
        '{broken',
        '',
        JSON.stringify({ resourceLogs: [resourceLog('b'), 'x'] }),
      ].join('\n'),
    );

    const { records, issues } = await readAnalyticsRecordings([file]);

    expect(records).toHaveLength(2);
    expect(issues).toEqual([
      { path: `${file}:2`, message: expect.stringContaining('Invalid JSON') },
      { path: `${file}:4 resourceLogs[1]`, message: 'Expected a ResourceLogs object.' },
    ]);
  });

  it('fails when a seed path does not exist', async () => {
    const store = new AnalyticsStore({ seed: join(dir, 'missing.jsonl') });

    await expect(store.ready()).rejects.toThrow(/ENOENT/);
  });

  it('warns about skipped seed lines', async () => {
    const file = join(dir, 'analytics.jsonl');
    await writeFile(file, `${JSON.stringify(resourceLog('a'))}\nnot json\n`);
    const warn = vi.fn();
    const store = new AnalyticsStore({ seed: file, warn });

    await store.ready();

    expect(store.getRecords()).toHaveLength(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`${file}:2`));
  });
});

describe('readStartupMockUserId', () => {
  it('reads the user of the MSAL mock startup token only', () => {
    expect(readStartupMockUserId(`Bearer ${startupToken('dev')}`)).toBe('dev');
    expect(readStartupMockUserId(undefined)).toBeUndefined();
    expect(
      readStartupMockUserId(
        `Bearer ${encode({ alg: 'RS256' })}.${encode({ oid: 'x' })}.fusion-test-signature`,
      ),
    ).toBeUndefined();
    expect(
      readStartupMockUserId(`Bearer ${encode({ alg: 'none' })}.${encode({ oid: 'x' })}.other`),
    ).toBeUndefined();
  });
});

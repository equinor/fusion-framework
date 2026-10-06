import { afterEach, describe, expect, it } from 'vitest';

import { createMockServer, type MockServerHandle } from '../../index.js';
import {
  type AppFeatureEventRow,
  defineAnalyticsMock,
  defineAppFeatureEventsMock,
  executeAppFeatureEventsQuery,
} from '../../presets/fusion/index.js';
import { toAnalyticsMicros } from '../../presets/fusion/analytics/pipeline/format/index.js';

/** The query `equinor/fusion-pss-project-demand` sends for its analytics page. */
const PSS_QUERY = `query AppFeatureEvents($appKey: String!, $since: DateTime!, $first: Int!, $after: String) {
  event_app_features(
    first: $first
    after: $after
    orderBy: { timestamp: ASC }
    filter: { data_appkey: { eq: $appKey }, event_name: { eq: "app-feature" }, timestamp: { gte: $since } }
  ) {
    items { timestamp data_feature data_body_data session_id _ingest_ts }
    hasNextPage
    endCursor
  }
}`;

/** Builds an app-feature row with defaults for every column. */
const row = (overrides: Partial<AppFeatureEventRow>): AppFeatureEventRow => ({
  event_name: 'app-feature',
  session_id: 's1',
  user_id: 'u1',
  portal_id: 'fusion',
  module_version: '3.0.8',
  timestamp: '2026-10-05T10:00:00Z',
  event_date: '2026-10-05T00:00:00Z',
  severity_number: 9,
  event_id: 'e',
  _source_file: 'mock',
  _ingest_ts: '2026-10-05T10:00:01Z',
  data_appkey: 'my-app',
  data_feature: 'f',
  data_body_data: null,
  data_context_id: null,
  data_context_type: null,
  data_context_title: null,
  data_context_external_id: null,
  data_context_source: null,
  ...overrides,
});

/** One `ResourceLogs` entry with one app-feature event. */
const resourceLog = (feature: string, time: string, appKey = 'my-app') => ({
  resource: { attributes: [{ key: 'portal.id', value: { stringValue: 'fusion' } }] },
  scopeLogs: [
    {
      logRecords: [
        {
          timeUnixNano: `${Date.parse(time)}000000`,
          severityNumber: 9,
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

/** Reads the items of an `event_app_features` result. */
const itemsOf = (result: { data?: unknown }) =>
  (result.data as { event_app_features: { items: Record<string, unknown>[] } }).event_app_features
    .items;

describe('defineAppFeatureEventsMock', () => {
  let server: MockServerHandle | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  /** Starts the Fusion preset with the analytics mocks sharing one store. */
  async function start(isAppAdmin?: (sender: { userId: string }) => boolean) {
    const monitor = defineAnalyticsMock({ warn: () => undefined });
    server = createMockServer()
      .use('fusion')
      .use([monitor, defineAppFeatureEventsMock({ store: monitor.store, isAppAdmin })]);
    const { url } = await server.start();
    return url;
  }

  /** Selects a mock-auth user and returns a bearer token for its browser session. */
  async function signIn(url: string, userId: string): Promise<string> {
    const selection = await fetch(`${url}/@fusion-mock/auth/user`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const cookie = selection.headers.getSetCookie()[0]?.split(';')[0] ?? '';
    const response = await fetch(`${url}/@fusion-mock/auth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ scopes: ['apps/.default'] }),
    });
    return ((await response.json()) as { token: string }).token;
  }

  /** Sends events through the mock Monitor service. */
  async function track(url: string, token: string, entries: unknown[]): Promise<void> {
    const response = await fetch(`${url}/monitor/v1/logs`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ resourceLogs: entries }),
    });
    expect(response.status).toBe(202);
  }

  /** Runs a GraphQL request through the mock Apps service. */
  async function query(url: string, token: string | undefined, body: unknown) {
    return fetch(`${url}/apps/apps/feature-events/query?api-version=1.0`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  it('answers the PSS analytics query with the session events, page by page', async () => {
    const url = await start();
    const token = await signIn(url, 'admin');
    await track(url, token, [
      resourceLog('page-viewed', '2026-10-05T10:00:02Z'),
      resourceLog('demand-created', '2026-10-05T10:00:01Z'),
      resourceLog('other-app', '2026-10-05T10:00:03Z', 'other'),
      resourceLog('too-old', '2026-09-01T00:00:00Z'),
    ]);

    const variables = {
      appKey: 'my-app',
      since: '2026-10-01T00:00:00.000Z',
      first: 1,
      after: null,
    };
    const first = await query(url, token, { query: PSS_QUERY, variables });
    expect(first.status).toBe(200);
    const firstPage = (await first.json()) as {
      data: { event_app_features: { items: unknown[]; hasNextPage: boolean; endCursor: string } };
    };
    expect(firstPage.data.event_app_features).toEqual({
      items: [
        {
          timestamp: '2026-10-05T10:00:01Z',
          data_feature: 'demand-created',
          data_body_data: '{"n":1}',
          session_id: null,
          _ingest_ts: expect.any(String),
        },
      ],
      hasNextPage: true,
      endCursor: expect.any(String),
    });

    const second = await query(url, token, {
      query: PSS_QUERY,
      variables: { ...variables, after: firstPage.data.event_app_features.endCursor },
    });
    expect(await second.json()).toEqual({
      data: {
        event_app_features: {
          items: [expect.objectContaining({ data_feature: 'page-viewed' })],
          hasNextPage: false,
          endCursor: null,
        },
      },
    });
  });

  it.each([
    '{ event_app_features(first: 100, orderBy: { event_date: DESC }) { items { event_id event_date event_name data_appkey data_feature data_context_id data_context_type data_context_title data_context_source data_context_external_id data_body_data portal_id user_id session_id } hasNextPage endCursor } }',
    '{ event_app_features(first: 100, orderBy: { event_date: DESC }, filter: { data_appkey: { eq: "my-app" } }) { items { event_id event_date data_appkey data_feature data_body_data user_id } hasNextPage endCursor } }',
    '{ event_app_features(first: 100, orderBy: { event_date: DESC }, filter: { data_feature: { eq: "page-viewed" } }) { items { event_id event_date data_appkey data_feature data_body_data user_id } hasNextPage endCursor } }',
    '{ event_app_features(first: 100, orderBy: { event_date: DESC }, filter: { event_date: { gte: "2026-01-01", lte: "2026-12-01" } }) { items { event_id event_date data_appkey data_feature user_id } hasNextPage endCursor } }',
    '{ event_app_features(first: 100, orderBy: { event_date: DESC }, filter: { user_id: { eq: "admin" } }) { items { event_id event_date data_appkey data_feature data_body_data session_id } hasNextPage endCursor } }',
    '{ event_app_features(first: 100, orderBy: { event_date: DESC }, filter: { portal_id: { eq: "fusion" } }) { items { event_id event_date data_appkey data_feature user_id } hasNextPage endCursor } }',
  ])('answers the documented example query %#', async (source) => {
    const url = await start();
    const token = await signIn(url, 'admin');
    await track(url, token, [resourceLog('page-viewed', '2026-10-05T10:00:00Z')]);

    const result = (await (await query(url, token, { query: source })).json()) as {
      data?: unknown;
      errors?: unknown;
    };

    expect(result.errors).toBeUndefined();
    expect(itemsOf(result)).toHaveLength(1);
  });

  it('answers introspection queries', async () => {
    const url = await start();
    const token = await signIn(url, 'admin');

    const result = (await (
      await query(url, token, {
        query: '{ __type(name: "event_app_feature") { name fields { name } } }',
      })
    ).json()) as { data: { __type: { fields: { name: string }[] } } };

    expect(result.data.__type.fields.map((field) => field.name)).toContain('data_body_data');
  });

  it('only returns the caller session events and keeps sessions apart', async () => {
    const url = await start();
    const [one, two] = await Promise.all([signIn(url, 'one'), signIn(url, 'two')]);
    await track(url, one, [resourceLog('from-one', '2026-10-05T10:00:00Z')]);
    await track(url, two, [resourceLog('from-two', '2026-10-05T10:00:00Z')]);

    const result = (await (
      await query(url, one, { query: '{ event_app_features { items { data_feature user_id } } }' })
    ).json()) as { data?: unknown };

    expect(itemsOf(result)).toEqual([{ data_feature: 'from-one', user_id: 'one' }]);
  });

  it('answers 401 without a signed-in user and 403 for a user who is not an app admin', async () => {
    const url = await start((sender) => sender.userId === 'admin');
    const reader = await signIn(url, 'reader');
    const body = { query: '{ event_app_features { items { event_id } } }' };

    expect((await query(url, undefined, body)).status).toBe(401);
    const forbidden = await query(url, reader, body);
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toMatchObject({ error: { code: 'Forbidden' } });
  });

  it('keeps the rest of the preset Apps service working', async () => {
    const url = await start();

    const response = await fetch(`${url}/@fusion-mock/discovery`);

    expect(await response.json()).toContainEqual(expect.objectContaining({ key: 'apps' }));
  });
});

describe('executeAppFeatureEventsQuery', () => {
  const rows = [
    row({
      event_id: 'a',
      data_feature: 'page-viewed',
      timestamp: '2026-10-05T10:00:00.5Z',
      data_context_type: 'Project',
    }),
    row({
      event_id: 'b',
      data_feature: 'page-left',
      timestamp: '2026-10-05T09:00:00Z',
      data_context_type: null,
    }),
    row({
      event_id: 'c',
      data_feature: 'search-empty',
      timestamp: '2026-10-04T23:59:59.999999Z',
      data_appkey: 'other',
    }),
  ];

  /** Runs a query and returns the event ids it selects. */
  const ids = async (args: string) => {
    const result = await executeAppFeatureEventsQuery(rows, {
      query: `{ event_app_features${args} { items { event_id } } }`,
    });
    expect(result.errors).toBeUndefined();
    return itemsOf(result).map((item) => item.event_id);
  };

  it.each([
    ['', ['a', 'b', 'c']],
    ['(filter: { data_feature: { startsWith: "page" } })', ['a', 'b']],
    ['(filter: { data_feature: { endsWith: "left" } })', ['b']],
    ['(filter: { data_feature: { contains: "EMPTY" } })', []],
    ['(filter: { data_feature: { notContains: "page" } })', ['c']],
    ['(filter: { data_feature: { in: ["page-left", "search-empty"] } })', ['b', 'c']],
    ['(filter: { data_appkey: { neq: "other" } })', ['a', 'b']],
    ['(filter: { data_context_type: { isNull: true } })', ['b', 'c']],
    ['(filter: { data_context_type: { neq: "Project" } })', []],
    ['(filter: { timestamp: { gte: "2026-10-05" } })', ['a', 'b']],
    ['(filter: { timestamp: { gt: "2026-10-05T10:00:00.4" } })', ['a']],
    ['(filter: { timestamp: { lt: "2026-10-05T02:00:00+02:00" } })', ['c']],
    ['(filter: { severity_number: { gte: 9 } })', ['a', 'b', 'c']],
    ['(filter: { or: [{ event_id: { eq: "a" } }, { event_id: { eq: "c" } }] })', ['a', 'c']],
    [
      '(filter: { and: [{ data_appkey: { eq: "my-app" } }, { data_feature: { contains: "left" } }] })',
      ['b'],
    ],
    ['(orderBy: { timestamp: ASC })', ['c', 'b', 'a']],
    ['(orderBy: { data_context_type: ASC })', ['b', 'c', 'a']],
    ['(orderBy: { data_context_type: DESC })', ['a', 'b', 'c']],
    ['(first: 2)', ['a', 'b']],
    ['(first: -1)', ['a', 'b', 'c']],
  ])('selects %s', async (args, expected) => {
    expect(await ids(args)).toEqual(expected);
  });

  it.each([
    [
      '(first: 0)',
      'Invalid number of items requested, first argument must be either -1 or a positive number within the max page size limit of 100000. Actual value: 0',
    ],
    ['(first: 100001)', 'max page size limit of 100000'],
    ['(after: "bad")', 'bad is not a valid pagination token.'],
    [
      '(filter: { timestamp: { gte: "yesterday" } })',
      'DateTime cannot parse the given value: yesterday',
    ],
    [
      '(filter: { timestamp: { gte: "2026-13-01" } })',
      'DateTime cannot parse the given value: 2026-13-01',
    ],
  ])('reports an error for %s', async (args, message) => {
    const result = await executeAppFeatureEventsQuery(rows, {
      query: `{ event_app_features${args} { items { event_id } } }`,
    });

    expect(result.errors?.[0]?.message).toContain(message);
  });

  it.each([
    [{}, 'The GraphQL request is empty.'],
    [{ query: '{ event_app_features { items { nope } } }' }, 'Cannot query field "nope"'],
    [{ query: '{ broken' }, 'Syntax Error'],
    [{ query: '{ event_app_features { groupBy } }' }, 'Cannot query field "groupBy"'],
    [{ query: '{ __typename }', variables: 'x' }, 'variables must be an object'],
  ])('reports an unsupported request %j', async (request, message) => {
    const result = await executeAppFeatureEventsQuery(rows, request);

    expect(result.errors?.[0]?.message).toContain(message);
  });
});

describe('toAnalyticsMicros', () => {
  it.each([
    ['2026-10-05', Date.UTC(2026, 9, 5) * 1000],
    ['2026-10-05T13:00:39.156999Z', Date.UTC(2026, 9, 5, 13, 0, 39) * 1000 + 156_999],
    ['2026-01-07T11:39:30.225000', Date.UTC(2026, 0, 7, 11, 39, 30) * 1000 + 225_000],
    ['2026-10-05T02:00:00+02:00', Date.UTC(2026, 9, 5) * 1000],
    ['2026-02-30', undefined],
    ['2028-02-29', Date.UTC(2028, 1, 29) * 1000],
    ['2026-13-01', undefined],
    ['2026-00-01', undefined],
    ['2026-10-05T24:00:00Z', undefined],
    ['2026-10-05T10:60:00Z', undefined],
    ['2026-10-05T10:00:60Z', undefined],
    ['2026-10-05T10:00:00+99:99', undefined],
    ['2026-10-05T10:00:00+14:01', undefined],
    ['2026-10-05T10:00:00+10:60', undefined],
    ['2026-10-05T10:00:00-14:00', Date.UTC(2026, 9, 6) * 1000],
    ['0099-01-01', -59042995200000000],
    ['soon', undefined],
  ])('reads %s', (value, micros) => {
    expect(toAnalyticsMicros(value)).toBe(micros);
  });
});

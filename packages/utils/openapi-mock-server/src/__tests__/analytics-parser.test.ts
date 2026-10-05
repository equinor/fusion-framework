import { describe, expect, it } from 'vitest';

import {
  parseOtlpLogsRequest,
  parseOtlpResourceLog,
  projectAnalyticsEvent,
  toAnalyticsTableName,
} from '../presets/fusion/index.js';
import { getJsonObject } from '../presets/fusion/analytics/get-json-object.js';
import { toPythonJson } from '../presets/fusion/analytics/to-python-json.js';

/** Builds an OTLP string value, as the OpenTelemetry JS serializer emits it. */
const str = (stringValue: string) => ({ stringValue });
/** Builds an OTLP key-value list value. */
const kvlist = (values: Record<string, unknown>) => ({
  kvlistValue: { values: Object.entries(values).map(([key, value]) => ({ key, value })) },
});
/** Builds an OTLP key-value list for record or resource attributes. */
const attrs = (values: Record<string, unknown>) =>
  Object.entries(values).map(([key, value]) => ({ key, value }));

const nanos = (iso: string) => `${Date.parse(iso)}000000`;

/**
 * One `ResourceLogs` entry as stored by the Monitor service: the analytics adapter's resource
 * attributes plus the `user.id` the service appends.
 */
const resourceLog = (logRecords: unknown[]) => ({
  resource: {
    attributes: attrs({
      'module.version': str('3.0.8'),
      'session.id': str('0199b4f2-0000-7000-8000-000000000001'),
      'portal.id': str('fusion'),
      'user.id': str('d8af743d-b894-40af-b4fc-660999fe8f8e'),
    }),
    droppedAttributesCount: 0,
  },
  scopeLogs: [{ scope: { name: 'fusion' }, logRecords }],
});

/** An `app-feature` log record shaped like what `useTrackFeature` produces. */
const appFeature = (time: string, feature: string, data: unknown, context?: unknown) => ({
  timeUnixNano: nanos(time),
  observedTimeUnixNano: nanos(time),
  severityNumber: 9,
  eventName: 'app-feature',
  body: kvlist({ feature: str(feature), data }),
  attributes: attrs({ appKey: str('pss-project-demand'), ...(context ? { context } : {}) }),
  droppedAttributesCount: 0,
});

const options = {
  sourceFile: 'recordings/analytics.jsonl',
  ingestedAt: new Date('2026-10-05T16:03:54.648Z'),
  createEventId: () => 'event-1',
};

describe('parseOtlpResourceLog', () => {
  it('reads an app-feature event into the same row the Apps service returns', () => {
    const { records, issues } = parseOtlpResourceLog(
      resourceLog([
        appFeature(
          '2026-10-05T13:00:39.157Z',
          'demand-lines-filtered',
          kvlist({ filter: str('column') }),
          kvlist({
            id: str('ctx-1'),
            externalId: str('ext-1'),
            title: str('My project'),
            type: str('PssProject'),
            source: str('ExcelImport'),
          }),
        ),
      ]),
      options,
    );

    expect(issues).toEqual([]);
    expect(records).toEqual([
      {
        event_id: 'event-1',
        // The pipeline converts through a double, so `.157` is stored as `.156999` (seen in CI).
        timestamp: '2026-10-05T13:00:39.156999Z',
        event_date: '2026-10-05T00:00:00Z',
        event_name: 'app-feature',
        session_id: '0199b4f2-0000-7000-8000-000000000001',
        user_id: 'd8af743d-b894-40af-b4fc-660999fe8f8e',
        portal_id: 'fusion',
        module_version: '3.0.8',
        severity_number: 9,
        res_attrs: {
          'module.version': '3.0.8',
          'session.id': '0199b4f2-0000-7000-8000-000000000001',
          'portal.id': 'fusion',
          'user.id': 'd8af743d-b894-40af-b4fc-660999fe8f8e',
        },
        data_body: '{"feature": "demand-lines-filtered", "data": {"filter": "column"}}',
        data_attributes:
          '{"appKey": "pss-project-demand", "context": {"id": "ctx-1", "externalId": "ext-1", "title": "My project", "type": "PssProject", "source": "ExcelImport"}}',
        _source_file: 'recordings/analytics.jsonl',
        _ingest_ts: '2026-10-05T16:03:54.648Z',
      },
    ]);

    expect(projectAnalyticsEvent(records[0])).toEqual({
      event_name: 'app-feature',
      session_id: '0199b4f2-0000-7000-8000-000000000001',
      user_id: 'd8af743d-b894-40af-b4fc-660999fe8f8e',
      portal_id: 'fusion',
      module_version: '3.0.8',
      timestamp: '2026-10-05T13:00:39.156999Z',
      event_date: '2026-10-05T00:00:00Z',
      severity_number: 9,
      event_id: 'event-1',
      _source_file: 'recordings/analytics.jsonl',
      _ingest_ts: '2026-10-05T16:03:54.648Z',
      data_appkey: 'pss-project-demand',
      data_feature: 'demand-lines-filtered',
      data_body_data: '{"filter":"column"}',
      data_context_id: 'ctx-1',
      data_context_type: 'PssProject',
      data_context_title: 'My project',
      data_context_external_id: 'ext-1',
      data_context_source: 'ExcelImport',
    });
  });

  it('stores missing feature data and context as null, as production does', () => {
    const { records } = parseOtlpResourceLog(
      // `useTrackFeature('x')` sends `data: undefined`, which the serializer encodes as `{}`.
      resourceLog([appFeature('2026-10-05T15:03:55.116Z', 'demand-lines-view-saved', {})]),
      options,
    );

    expect(records[0].timestamp).toBe('2026-10-05T15:03:55.116Z');
    expect(projectAnalyticsEvent(records[0])).toMatchObject({
      data_feature: 'demand-lines-view-saved',
      data_body_data: null,
      data_context_id: null,
      data_context_type: null,
    });
  });

  it('keeps scalar, nested, and array feature data the way get_json_object returns it', () => {
    const { records } = parseOtlpResourceLog(
      resourceLog([
        appFeature('2026-10-05T10:00:00Z', 'text', str('plain')),
        appFeature('2026-10-05T10:00:01Z', 'count', { intValue: '3' }),
        appFeature('2026-10-05T10:00:02Z', 'ratio', { doubleValue: 0.5 }),
        appFeature('2026-10-05T10:00:03Z', 'flag', { boolValue: true }),
        appFeature('2026-10-05T10:00:04Z', 'list', {
          arrayValue: { values: [str('a'), { intValue: 2 }, kvlist({ b: { boolValue: false } })] },
        }),
      ]),
      options,
    );

    expect(records.map((record) => projectAnalyticsEvent(record))).toMatchObject([
      { data_body_data: 'plain' },
      { data_body_data: '3' },
      { data_body_data: '0.5' },
      { data_body_data: 'true' },
      { data_body_data: '["a",2,{"b":false}]' },
    ]);
    expect(records[4].data_body).toBe('{"feature": "list", "data": ["a", 2, {"b": false}]}');
  });

  it('stores a body that is not a key-value list as null, as production does', () => {
    const { records } = parseOtlpResourceLog(
      resourceLog([
        {
          timeUnixNano: nanos('2026-10-05T10:00:00Z'),
          severityNumber: 9,
          eventName: 'window-clicker',
          body: { intValue: 69 },
        },
      ]),
      options,
    );

    expect(records[0]).toMatchObject({ data_body: null, data_attributes: null });
    expect(projectAnalyticsEvent(records[0])).toMatchObject({
      event_name: 'window-clicker',
      data_body: null,
      data_attributes: null,
    });
  });

  it('promotes the columns of app-loaded, app-selected, and context-selected events', () => {
    const context = kvlist({ id: str('ctx-1'), type: str('ProjectMaster') });
    const { records } = parseOtlpResourceLog(
      resourceLog([
        {
          timeUnixNano: nanos('2026-10-05T10:00:00Z'),
          eventName: 'app-loaded',
          body: kvlist({
            appKey: str('my-app'),
            displayName: str('My app'),
            type: str('standalone'),
            categoryName: str('Tools'),
            buildVersion: str('1.2.3'),
            buildTag: str('latest'),
          }),
          attributes: attrs({ context }),
        },
        {
          timeUnixNano: nanos('2026-10-05T10:00:01Z'),
          eventName: 'app-selected',
          body: kvlist({ appKey: str('my-app') }),
          attributes: attrs({ previous: kvlist({ appKey: str('other-app') }) }),
        },
        {
          timeUnixNano: nanos('2026-10-05T10:00:02Z'),
          eventName: 'context-selected',
          body: kvlist({
            id: str('ctx-2'),
            type: str('ProjectMaster'),
            title: str('Next'),
            externalId: str('ext-2'),
            source: str('Pims'),
          }),
          attributes: attrs({
            appKey: str('my-app'),
            previous: kvlist({ id: str('ctx-1'), title: str('Before') }),
          }),
        },
      ]),
      options,
    );

    const [loaded, selected, contextSelected] = records.map((record) =>
      projectAnalyticsEvent(record),
    );
    expect(loaded).toMatchObject({
      data_appkey: 'my-app',
      data_displayname: 'My app',
      data_type: 'standalone',
      data_categoryname: 'Tools',
      data_buildversion: '1.2.3',
      data_buildtag: 'latest',
      data_context_id: 'ctx-1',
      data_context_type: 'ProjectMaster',
    });
    expect(loaded).not.toHaveProperty('data_body');
    expect(selected).toMatchObject({ data_appkey: 'my-app', data_previous_appkey: 'other-app' });
    expect(contextSelected).toMatchObject({
      data_appkey: 'my-app',
      data_id: 'ctx-2',
      data_type: 'ProjectMaster',
      data_title: 'Next',
      data_external_id: 'ext-2',
      data_source: 'Pims',
      data_previous_id: 'ctx-1',
      data_previous_title: 'Before',
      data_previous_type: null,
    });
  });

  it('keeps the body and attributes of unknown events as JSON', () => {
    const { records } = parseOtlpResourceLog(
      resourceLog([
        {
          timeUnixNano: nanos('2026-10-05T10:00:00Z'),
          eventName: 'helpcenter:opened',
          body: kvlist({ page: str('home') }),
          attributes: attrs({ appKey: str('my-app') }),
        },
      ]),
      options,
    );

    const row = projectAnalyticsEvent(records[0]);
    expect(row).toMatchObject({
      event_name: 'helpcenter:opened',
      data_body: '{"page": "home"}',
      data_attributes: '{"appKey": "my-app"}',
    });
    expect(toAnalyticsTableName(row?.event_name ?? null)).toBe('event_helpcenter_opened');
  });

  it('reports and skips broken entries while reading the rest', () => {
    const { records, issues } = parseOtlpResourceLog(
      {
        resource: { attributes: attrs({ 'portal.id': str('fusion') }) },
        scopeLogs: [
          { logRecords: [null, appFeature('2026-10-05T10:00:00Z', 'kept', {})] },
          'not a scope',
          { logRecords: 'not a list' },
        ],
      },
      options,
      'resourceLogs[0]',
    );

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ portal_id: 'fusion', session_id: null });
    expect(issues).toEqual([
      {
        path: 'resourceLogs[0].scopeLogs[0].logRecords[0]',
        message: 'Expected a LogRecord object.',
      },
      { path: 'resourceLogs[0].scopeLogs[1]', message: 'Expected a ScopeLogs object.' },
      { path: 'resourceLogs[0].scopeLogs[2].logRecords', message: 'Expected a list.' },
    ]);
  });

  it('reads records without a time or event name, and keeps them out of event tables', () => {
    const { records } = parseOtlpResourceLog(
      resourceLog([{ timeUnixNano: 'soon', body: kvlist({}) }]),
      options,
    );

    expect(records[0]).toMatchObject({
      timestamp: null,
      event_date: null,
      event_name: null,
      data_body: '{}',
    });
    expect(projectAnalyticsEvent(records[0])).toBeUndefined();
  });

  it('assigns a random event id and the current time by default', () => {
    const before = Date.now();
    const { records } = parseOtlpResourceLog(
      resourceLog([appFeature('2026-10-05T10:00:00Z', 'x', {})]),
      { sourceFile: 'mock' },
    );

    expect(records[0].event_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Date.parse(records[0]._ingest_ts)).toBeGreaterThanOrEqual(before - 1);
  });
});

describe('parseOtlpLogsRequest', () => {
  it('reads every resourceLogs entry of a POST /v1/logs body', () => {
    const { records, issues } = parseOtlpLogsRequest(
      {
        resourceLogs: [
          resourceLog([appFeature('2026-10-05T10:00:00Z', 'a', {})]),
          'broken',
          resourceLog([appFeature('2026-10-05T10:00:01Z', 'b', {})]),
        ],
      },
      options,
    );

    expect(records.map((record) => getJsonObject(record.data_body, ['feature']))).toEqual([
      'a',
      'b',
    ]);
    expect(issues).toEqual([
      { path: 'resourceLogs[1]', message: 'Expected a ResourceLogs object.' },
    ]);
  });

  it.each([null, [], {}, { resourceLogs: 'x' }])(
    'reports a body without resourceLogs: %j',
    (body) => {
      expect(parseOtlpLogsRequest(body, options)).toEqual({
        records: [],
        issues: [{ path: 'resourceLogs', message: 'Expected a body with a resourceLogs list.' }],
      });
    },
  );
});

describe('toAnalyticsTableName', () => {
  it.each([
    ['app-feature', 'event_app_feature'],
    ['Context-Selected', 'event_context_selected'],
    [':opened:', 'event_opened'],
    ['@app:fusion-help:open', 'event_app_fusion_help_open'],
    ['---', 'event_unknown'],
    [null, 'event_unknown'],
  ])('names the table for %j', (eventName, table) => {
    expect(toAnalyticsTableName(eventName)).toBe(table);
  });
});

describe('getJsonObject', () => {
  it.each([
    [null, ['a'], null],
    ['not json', ['a'], null],
    ['{"a": null}', ['a'], null],
    ['{"a": [1]}', ['a', 'b'], null],
    ['{"a": {"b": "x"}}', ['a', 'b'], 'x'],
    ['{"a": 1.5}', ['a'], '1.5'],
  ] as const)('reads %j at %j', (json, path, expected) => {
    expect(getJsonObject(json, path)).toBe(expected);
  });
});

describe('toPythonJson', () => {
  it('uses Python json.dumps separators and keeps non-ASCII text', () => {
    expect(toPythonJson({ a: [1, 'ø', { b: null }], 'c"d': true })).toBe(
      '{"a": [1, "ø", {"b": null}], "c\\"d": true}',
    );
  });
});

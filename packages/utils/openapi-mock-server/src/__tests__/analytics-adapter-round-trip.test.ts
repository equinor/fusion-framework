import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import { FusionAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/adapters';
import { FusionOTLPLogExporter } from '@equinor/fusion-framework-module-analytics/logExporters';
import { afterEach, describe, expect, it } from 'vitest';

import { parseOtlpLogsRequest, projectAnalyticsEvent } from '../presets/fusion/index.js';

/** A `POST /v1/logs` request captured from the real exporter. */
interface CapturedRequest {
  path: string;
  body: unknown;
}

/**
 * Creates a stand-in for the `monitor` HTTP client that captures what `FusionOTLPLogExporter`
 * posts, so the test reads exactly the bytes production sends to the Monitor service.
 */
function createCapturingClient(): {
  client: IHttpClient;
  nextRequest: () => Promise<CapturedRequest>;
} {
  const waiting: ((request: CapturedRequest) => void)[] = [];
  const client = {
    fetch: async (path: string, init: { body: Blob }): Promise<Response> => {
      const body: unknown = JSON.parse(await init.body.text());
      waiting.shift()?.({ path, body });
      return new Response(null, { status: 202 });
    },
  } as unknown as IHttpClient;
  return { client, nextRequest: () => new Promise((resolve) => waiting.push(resolve)) };
}

describe('reading analytics sent by the framework analytics adapter', () => {
  let adapter: FusionAnalyticsAdapter | undefined;

  afterEach(() => {
    adapter?.[Symbol.dispose]();
    adapter = undefined;
  });

  it('reads useTrackFeature events into the rows the Apps service returns', async () => {
    const { client, nextRequest } = createCapturingClient();
    const request = nextRequest();
    adapter = new FusionAnalyticsAdapter({
      portalId: 'fusion',
      logExporter: new FusionOTLPLogExporter(client),
    });
    const sentAfter = Date.now();

    // The same event shapes useTrackFeature builds, with and without data and context.
    adapter.registerAnalytic({
      name: 'app-feature',
      value: { feature: 'page-viewed', data: { route: '/demands/:id', tabs: ['a', 'b'] } },
      attributes: {
        appKey: 'pss-project-demand',
        context: {
          id: 'ctx-1',
          externalId: 'ext-1',
          title: 'My project',
          type: 'PssProject',
          source: 'ExcelImport',
        },
      },
    });
    adapter.registerAnalytic({
      name: 'app-feature',
      value: { feature: 'demand-lines-view-saved', data: undefined },
      attributes: { appKey: 'pss-project-demand', context: undefined },
    });

    const { path, body } = await request;
    expect(path).toBe('/v1/logs');

    const { records, issues } = parseOtlpLogsRequest(body, { sourceFile: 'mock' });
    expect(issues).toEqual([]);
    const rows = records.map((record) => projectAnalyticsEvent(record));

    expect(rows).toEqual([
      expect.objectContaining({
        event_name: 'app-feature',
        portal_id: 'fusion',
        severity_number: 9,
        data_appkey: 'pss-project-demand',
        data_feature: 'page-viewed',
        data_body_data: '{"route":"/demands/:id","tabs":["a","b"]}',
        data_context_id: 'ctx-1',
        data_context_type: 'PssProject',
        data_context_title: 'My project',
        data_context_external_id: 'ext-1',
        data_context_source: 'ExcelImport',
      }),
      expect.objectContaining({
        event_name: 'app-feature',
        data_feature: 'demand-lines-view-saved',
        data_body_data: null,
        data_context_id: null,
      }),
    ]);

    const [first] = records;
    // The adapter creates one UUIDv7 session per instance; the Monitor service adds the user later.
    expect(first.session_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/);
    expect(records[1].session_id).toBe(first.session_id);
    expect(first.user_id).toBeNull();
    expect(first.module_version).toMatch(/^\d+\.\d+\.\d+/);
    expect(Date.parse(first.timestamp ?? '')).toBeGreaterThanOrEqual(sentAfter - 1);
    expect(first.event_date).toBe(`${(first.timestamp ?? '').slice(0, 10)}T00:00:00Z`);
  });
});

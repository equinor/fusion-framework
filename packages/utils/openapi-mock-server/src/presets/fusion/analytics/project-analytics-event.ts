import { getJsonObject } from './get-json-object.js';
import type {
  AnalyticsContextColumns,
  AnalyticsEventRow,
  AnalyticsEventRowBase,
  AnalyticsRecord,
} from './types.js';

/**
 * Turns an analytics record into the row Fusion's analytics pipeline stores in the event's own
 * table (`event_app_feature`, `event_context_selected`, …), promoting known fields to columns.
 *
 * @remarks
 * Mirrors section 5 of the `nb_fcore_featurelogs` notebook (`EVENT_PROJECTIONS`):
 *
 * - `app-feature` — what `useTrackFeature` sends — gets `data_appkey`, `data_feature`,
 *   `data_body_data`, and the `data_context_*` columns. This is the row the Apps service's
 *   `event_app_features` query returns.
 * - `app-loaded`, `app-selected`, and `context-selected` get their own columns.
 * - Any other event keeps `data_body` and `data_attributes` as JSON.
 *
 * Promoted columns are extracted like Spark's `get_json_object`: objects become compact JSON and
 * scalars become their text. Records without an `event_name` are not stored in any event table.
 *
 * @param record - A record read by `parseOtlpResourceLog` or `parseOtlpLogsRequest`.
 * @returns The event table row, or `undefined` when the record has no `event_name`.
 *
 * @example
 * ```typescript
 * const rows = records
 *   .map(projectAnalyticsEvent)
 *   .filter((row) => row?.event_name === 'app-feature');
 * ```
 */
export function projectAnalyticsEvent(record: AnalyticsRecord): AnalyticsEventRow | undefined {
  const { event_name: eventName } = record;
  // The pipeline routes rows by event name and drops rows without one.
  if (eventName === null) return undefined;

  const base: AnalyticsEventRowBase = {
    event_name: eventName,
    session_id: record.session_id,
    user_id: record.user_id,
    portal_id: record.portal_id,
    module_version: record.module_version,
    timestamp: record.timestamp,
    event_date: record.event_date,
    severity_number: record.severity_number,
    event_id: record.event_id,
    _source_file: record._source_file,
    _ingest_ts: record._ingest_ts,
  };
  const body = (...path: string[]): string | null => getJsonObject(record.data_body, path);
  const attributes = (...path: string[]): string | null =>
    getJsonObject(record.data_attributes, path);

  // Known events get the pipeline's promoted columns; every other event keeps its raw JSON.
  switch (eventName) {
    case 'app-feature':
      // Shared columns first, then the promoted app-feature and context columns.
      return {
        ...base,
        event_name: eventName,
        data_appkey: attributes('appKey'),
        data_feature: body('feature'),
        data_body_data: body('data'),
        ...readContextColumns(record.data_attributes),
      };
    case 'app-loaded':
      // Shared columns first, then the promoted app-loaded and context columns.
      return {
        ...base,
        event_name: eventName,
        data_appkey: body('appKey'),
        data_displayname: body('displayName'),
        data_type: body('type'),
        data_categoryname: body('categoryName'),
        data_buildversion: body('buildVersion'),
        data_buildtag: body('buildTag'),
        ...readContextColumns(record.data_attributes),
      };
    case 'app-selected':
      return {
        ...base,
        event_name: eventName,
        data_appkey: body('appKey'),
        data_previous_appkey: attributes('previous', 'appKey'),
      };
    case 'context-selected':
      return {
        ...base,
        event_name: eventName,
        data_appkey: attributes('appKey'),
        data_id: body('id'),
        data_type: body('type'),
        data_title: body('title'),
        data_external_id: body('externalId'),
        data_source: body('source'),
        data_previous_id: attributes('previous', 'id'),
        data_previous_type: attributes('previous', 'type'),
        data_previous_title: attributes('previous', 'title'),
        data_previous_external_id: attributes('previous', 'externalId'),
        data_previous_source: attributes('previous', 'source'),
      };
    default:
      return { ...base, data_body: record.data_body, data_attributes: record.data_attributes };
  }
}

/**
 * Promotes the `context` attribute to the shared context columns.
 *
 * @param dataAttributes - The record's `data_attributes` JSON.
 * @returns The `data_context_*` columns.
 */
function readContextColumns(dataAttributes: string | null): AnalyticsContextColumns {
  return {
    data_context_id: getJsonObject(dataAttributes, ['context', 'id']),
    data_context_type: getJsonObject(dataAttributes, ['context', 'type']),
    data_context_title: getJsonObject(dataAttributes, ['context', 'title']),
    data_context_external_id: getJsonObject(dataAttributes, ['context', 'externalId']),
    data_context_source: getJsonObject(dataAttributes, ['context', 'source']),
  };
}

export default projectAnalyticsEvent;

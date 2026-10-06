/**
 * A plain JSON value: what an OpenTelemetry `AnyValue` becomes once the analytics pipeline has
 * unwrapped its type tags (`stringValue`, `kvlistValue`, …).
 *
 * @remarks
 * 64-bit integers beyond `Number.MAX_SAFE_INTEGER` are kept as `bigint`, because the pipeline's
 * Python `int()` keeps every digit and a JavaScript `number` would round them.
 */
export type AnalyticsJsonValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | AnalyticsJsonValue[]
  | { [key: string]: AnalyticsJsonValue };

/**
 * One analytics event as Fusion's analytics pipeline stores it in its raw (bronze) table: one row
 * per OpenTelemetry log record, before event-specific columns are promoted.
 *
 * @remarks
 * Field names and value formats follow the `nb_fcore_featurelogs` notebook in
 * `equinor/fusion-core-fabric`, and timestamps are rendered the way the Apps service's
 * `POST /apps/feature-events/query` returns them.
 */
export interface AnalyticsRecord {
  /** Random UUID assigned when the record is read. */
  event_id: string;
  /** When the event happened (`timeUnixNano`), as an ISO 8601 UTC timestamp with up to microsecond precision. */
  timestamp: string | null;
  /** The UTC day of {@link AnalyticsRecord.timestamp}, as `YYYY-MM-DDT00:00:00Z`. */
  event_date: string | null;
  /** The OpenTelemetry `eventName`, for example `app-feature`. */
  event_name: string | null;
  /** The `session.id` resource attribute set by the analytics adapter. */
  session_id: string | null;
  /** The `user.id` resource attribute the Monitor service stamps from the caller's token. */
  user_id: string | null;
  /** The `portal.id` resource attribute. */
  portal_id: string | null;
  /** The `module.version` resource attribute: the analytics module version that sent the event. */
  module_version: string | null;
  /** The OpenTelemetry severity number; `9` (INFO) for analytics events. */
  severity_number: number | null;
  /** Every resource attribute, one level deep; nested values stay as their raw OpenTelemetry JSON. */
  res_attrs: Record<string, string | null>;
  /** The log record body's key-value list, fully unwrapped into a JSON object string. */
  data_body: string | null;
  /** The log record attributes, fully unwrapped into a JSON object string. */
  data_attributes: string | null;
  /** Where the record was read from, for example a recording file. */
  _source_file: string;
  /** When the record was read, as an ISO 8601 UTC timestamp. */
  _ingest_ts: string;
}

/**
 * Columns shared by every per-event analytics table (`event_<name>`), in the pipeline's order.
 */
export interface AnalyticsEventRowBase {
  /** The OpenTelemetry `eventName`. */
  event_name: string;
  /** See {@link AnalyticsRecord.session_id}. */
  session_id: string | null;
  /** See {@link AnalyticsRecord.user_id}. */
  user_id: string | null;
  /** See {@link AnalyticsRecord.portal_id}. */
  portal_id: string | null;
  /** See {@link AnalyticsRecord.module_version}. */
  module_version: string | null;
  /** See {@link AnalyticsRecord.timestamp}. */
  timestamp: string | null;
  /** See {@link AnalyticsRecord.event_date}. */
  event_date: string | null;
  /** See {@link AnalyticsRecord.severity_number}. */
  severity_number: number | null;
  /** See {@link AnalyticsRecord.event_id}. */
  event_id: string;
  /** See {@link AnalyticsRecord._source_file}. */
  _source_file: string;
  /** See {@link AnalyticsRecord._ingest_ts}. */
  _ingest_ts: string;
}

/** Context columns the pipeline promotes from an event's `context` attribute. */
export interface AnalyticsContextColumns {
  /** `attributes.context.id`. */
  data_context_id: string | null;
  /** `attributes.context.type`. */
  data_context_type: string | null;
  /** `attributes.context.title`. */
  data_context_title: string | null;
  /** `attributes.context.externalId`. */
  data_context_external_id: string | null;
  /** `attributes.context.source`. */
  data_context_source: string | null;
}

/**
 * An `app-feature` event — what `useTrackFeature` sends — as stored in `event_app_feature` and
 * returned by the Apps service's `event_app_features` query.
 */
export interface AppFeatureEventRow extends AnalyticsEventRowBase, AnalyticsContextColumns {
  event_name: 'app-feature';
  /** `attributes.appKey`: the app that tracked the feature. */
  data_appkey: string | null;
  /** `body.feature`: the tracked feature name. */
  data_feature: string | null;
  /** `body.data`: the feature data, as compact JSON for objects and arrays, or the plain text of a scalar. */
  data_body_data: string | null;
}

/** An `app-loaded` event, as stored in `event_app_loaded`. */
export interface AppLoadedEventRow extends AnalyticsEventRowBase, AnalyticsContextColumns {
  event_name: 'app-loaded';
  /** `body.appKey`. */
  data_appkey: string | null;
  /** `body.displayName`. */
  data_displayname: string | null;
  /** `body.type`. */
  data_type: string | null;
  /** `body.categoryName`. */
  data_categoryname: string | null;
  /** `body.buildVersion`. */
  data_buildversion: string | null;
  /** `body.buildTag`. */
  data_buildtag: string | null;
}

/** An `app-selected` event, as stored in `event_app_selected`. */
export interface AppSelectedEventRow extends AnalyticsEventRowBase {
  event_name: 'app-selected';
  /** `body.appKey`: the selected app. */
  data_appkey: string | null;
  /** `attributes.previous.appKey`: the app selected before. */
  data_previous_appkey: string | null;
}

/** A `context-selected` event, as stored in `event_context_selected`. */
export interface ContextSelectedEventRow extends AnalyticsEventRowBase {
  event_name: 'context-selected';
  /** `attributes.appKey`. */
  data_appkey: string | null;
  /** `body.id`. */
  data_id: string | null;
  /** `body.type`. */
  data_type: string | null;
  /** `body.title`. */
  data_title: string | null;
  /** `body.externalId`. */
  data_external_id: string | null;
  /** `body.source`. */
  data_source: string | null;
  /** `attributes.previous.id`. */
  data_previous_id: string | null;
  /** `attributes.previous.type`. */
  data_previous_type: string | null;
  /** `attributes.previous.title`. */
  data_previous_title: string | null;
  /** `attributes.previous.externalId`. */
  data_previous_external_id: string | null;
  /** `attributes.previous.source`. */
  data_previous_source: string | null;
}

/** Any other event, which the pipeline stores with its body and attributes as JSON. */
export interface UnprojectedAnalyticsEventRow extends AnalyticsEventRowBase {
  /** See {@link AnalyticsRecord.data_body}. */
  data_body: string | null;
  /** See {@link AnalyticsRecord.data_attributes}. */
  data_attributes: string | null;
}

/** A row in one of the pipeline's per-event analytics tables. */
export type AnalyticsEventRow =
  | AppFeatureEventRow
  | AppLoadedEventRow
  | AppSelectedEventRow
  | ContextSelectedEventRow
  | UnprojectedAnalyticsEventRow;

/** Options for reading OpenTelemetry logs into {@link AnalyticsRecord}s. */
export interface ParseOtlpLogsOptions {
  /** Stored as {@link AnalyticsRecord._source_file}, for example the recording file a line came from. */
  sourceFile: string;
  /** Stored as {@link AnalyticsRecord._ingest_ts}. Defaults to the current time. */
  ingestedAt?: Date;
  /** Creates {@link AnalyticsRecord.event_id}. Defaults to a random UUID. */
  createEventId?: () => string;
}

/** A part of an OpenTelemetry logs payload that could not be read and was skipped. */
export interface OtlpParseIssue {
  /** Where the problem is, as a JSON path such as `resourceLogs[0].scopeLogs[1].logRecords[2]`. */
  path: string;
  /** What is wrong. */
  message: string;
}

/** The result of reading an OpenTelemetry logs payload. */
export interface ParsedOtlpLogs {
  /** One record per readable log record, in payload order. */
  records: AnalyticsRecord[];
  /** Parts that were skipped. Readable records are returned even when issues are reported. */
  issues: OtlpParseIssue[];
}

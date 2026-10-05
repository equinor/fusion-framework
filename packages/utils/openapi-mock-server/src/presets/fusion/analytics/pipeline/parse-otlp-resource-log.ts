import { randomUUID } from 'node:crypto';

import { flattenOtlpKeyValues, toOtlpAttributeMap } from './otlp/index.js';
import { formatAnalyticsTimestamp, toPythonJson } from './format/index.js';
import { isJsonObject } from '../utils/index.js';
import type { AnalyticsRecord, ParsedOtlpLogs, ParseOtlpLogsOptions } from '../types.js';

/**
 * Reads one OpenTelemetry `ResourceLogs` entry into analytics records, the way Fusion's analytics
 * pipeline reads one line of its landing-zone files.
 *
 * @remarks
 * Use this for a single entry of a `POST /v1/logs` request's `resourceLogs`, or for one line of a
 * recording or `logs_*.json.gz` landing-zone file — the Monitor service stores each entry as its
 * own line. Mirrors section 3 of the `nb_fcore_featurelogs` notebook in `equinor/fusion-core-fabric`:
 *
 * - one record per log record across all `scopeLogs`;
 * - `session_id`, `user_id`, `portal_id`, and `module_version` come from the resource attributes;
 * - `data_body` is the body's key-value list and `data_attributes` the log record attributes, fully
 *   unwrapped and serialized like Python's `json.dumps`. A body that is not a key-value list — a
 *   plain string or number — is stored as `null`, as in production;
 * - `timestamp` is `timeUnixNano` converted through a double, exactly like the pipeline's
 *   `cast('long') / 1e9` and `cast('timestamp')`, so values match production to the microsecond.
 *
 * Entries that are not objects are skipped and reported in `issues`; the rest are still read.
 *
 * @param resourceLog - One `ResourceLogs` entry from a parsed JSON payload.
 * @param options - Source, ingest time, and id generation for the records.
 * @param path - JSON path of `resourceLog` used in reported issues. Defaults to `resourceLog`.
 * @returns The records and any skipped parts.
 *
 * @example
 * ```typescript
 * const { records, issues } = parseOtlpResourceLog(JSON.parse(line), {
 *   sourceFile: 'recordings/analytics.jsonl',
 * });
 * ```
 */
export function parseOtlpResourceLog(
  resourceLog: unknown,
  options: ParseOtlpLogsOptions,
  path = 'resourceLog',
): ParsedOtlpLogs {
  const records: AnalyticsRecord[] = [];
  const issues: ParsedOtlpLogs['issues'] = [];

  // A line that is not an object cannot hold log records, so it is reported instead of read.
  if (!isJsonObject(resourceLog)) {
    issues.push({ path, message: 'Expected a ResourceLogs object.' });
    return { records, issues };
  }

  const createEventId = options.createEventId ?? randomUUID;
  const ingestedAt = formatAnalyticsTimestamp((options.ingestedAt ?? new Date()).getTime() * 1000);
  const resource = isJsonObject(resourceLog.resource) ? resourceLog.resource : undefined;
  const resAttrs = toOtlpAttributeMap(resource?.attributes);

  const scopeLogs = readList(resourceLog.scopeLogs, `${path}.scopeLogs`, issues);
  // Every log record of every scope becomes one record, as the pipeline's double explode does.
  for (const [scopeIndex, scopeLog] of scopeLogs.entries()) {
    const scopePath = `${path}.scopeLogs[${scopeIndex}]`;
    // A malformed scope is reported, and the remaining scopes are still read.
    if (!isJsonObject(scopeLog)) {
      issues.push({ path: scopePath, message: 'Expected a ScopeLogs object.' });
      // Skip only this scope so one bad entry does not drop the batch.
      continue;
    }

    const logRecords = readList(scopeLog.logRecords, `${scopePath}.logRecords`, issues);
    // Each log record is one analytics event.
    for (const [recordIndex, logRecord] of logRecords.entries()) {
      // A malformed log record is reported, and the remaining records are still read.
      if (!isJsonObject(logRecord)) {
        issues.push({
          path: `${scopePath}.logRecords[${recordIndex}]`,
          message: 'Expected a LogRecord object.',
        });
        // Skip only this record so one bad event does not drop the batch.
        continue;
      }

      const micros = toTimestampMicros(logRecord.timeUnixNano);
      const body = isJsonObject(logRecord.body) ? logRecord.body : undefined;
      const bodyValues = isJsonObject(body?.kvlistValue) ? body.kvlistValue.values : undefined;
      const dataBody = flattenOtlpKeyValues(bodyValues);
      const dataAttributes = flattenOtlpKeyValues(logRecord.attributes);

      records.push({
        event_id: createEventId(),
        timestamp: micros === null ? null : formatAnalyticsTimestamp(micros),
        event_date: micros === null ? null : toEventDate(micros),
        event_name: typeof logRecord.eventName === 'string' ? logRecord.eventName : null,
        session_id: resAttrs['session.id'] ?? null,
        user_id: resAttrs['user.id'] ?? null,
        portal_id: resAttrs['portal.id'] ?? null,
        module_version: resAttrs['module.version'] ?? null,
        severity_number: toSeverityNumber(logRecord.severityNumber),
        res_attrs: resAttrs,
        data_body: dataBody === null ? null : toPythonJson(dataBody),
        data_attributes: dataAttributes === null ? null : toPythonJson(dataAttributes),
        _source_file: options.sourceFile,
        _ingest_ts: ingestedAt,
      });
    }
  }

  return { records, issues };
}

/**
 * Reads an optional list from a payload. A missing list yields no records, as in the pipeline;
 * a value that is present but not a list is reported.
 *
 * @param value - The candidate list.
 * @param path - JSON path used in a reported issue.
 * @param issues - Collected issues to append to.
 * @returns The list, or an empty list.
 */
function readList(value: unknown, path: string, issues: ParsedOtlpLogs['issues']): unknown[] {
  // A list is read as it is.
  if (Array.isArray(value)) return value;
  // A missing list is normal and silent; a value of the wrong type is worth reporting.
  if (value !== undefined && value !== null) {
    issues.push({ path, message: 'Expected a list.' });
  }
  return [];
}

/**
 * Converts `timeUnixNano` to whole microseconds exactly like the pipeline: the nanoseconds are
 * converted to a double, divided by 1e9, multiplied by 1e6, and truncated. That is why an event
 * sent at `.157` seconds is stored as `.156999` in production.
 *
 * @param timeUnixNano - Integer nanoseconds as text (the OTLP JSON form) or as a number.
 * @returns Whole microseconds, or `null` when the value is missing or not an integer.
 */
function toTimestampMicros(timeUnixNano: unknown): number | null {
  let nanos: number;
  // OTLP JSON sends nanoseconds as integer text; numbers are accepted too, and anything else has no time.
  if (typeof timeUnixNano === 'string' && /^\s*[+-]?\d+\s*$/.test(timeUnixNano)) {
    // BigInt first so the text rounds to the nearest double once, like Java's long-to-double.
    nanos = Number(BigInt(timeUnixNano.trim()));
  } else if (typeof timeUnixNano === 'number' && Number.isInteger(timeUnixNano)) {
    nanos = timeUnixNano;
  } else {
    return null;
  }
  return Math.trunc((nanos / 1e9) * 1e6);
}

/**
 * Formats the UTC day of a timestamp the way Fabric's GraphQL API renders `event_date`.
 *
 * @param micros - Whole microseconds since the Unix epoch.
 * @returns The day as `YYYY-MM-DDT00:00:00Z`.
 */
function toEventDate(micros: number): string {
  const day = new Date(Math.floor(micros / 1000)).toISOString().slice(0, 10);
  return `${day}T00:00:00Z`;
}

/**
 * Reads the OpenTelemetry severity number as an integer, like the pipeline's `cast('int')`.
 *
 * @param value - The log record's `severityNumber`.
 * @returns The severity number, or `null` when it is missing or not numeric.
 */
function toSeverityNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' && value.trim() ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

export default parseOtlpResourceLog;

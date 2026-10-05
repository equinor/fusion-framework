import { isJsonObject } from './is-json-object.js';
import { parseOtlpResourceLog } from './parse-otlp-resource-log.js';
import type { ParsedOtlpLogs, ParseOtlpLogsOptions } from './types.js';

/**
 * Reads the body of an OpenTelemetry `POST /v1/logs` request — what the Fusion analytics adapter
 * sends to the Monitor service — into analytics records, the way Fusion's analytics pipeline
 * reads them.
 *
 * @remarks
 * Reads every `resourceLogs` entry with {@link parseOtlpResourceLog}. A body without a
 * `resourceLogs` list is reported as an issue and yields no records. Entries that cannot be read
 * are reported and skipped; the rest are still returned.
 *
 * @param body - The parsed JSON request body.
 * @param options - Source, ingest time, and id generation for the records.
 * @returns The records and any skipped parts.
 *
 * @example
 * ```typescript
 * const { records, issues } = parseOtlpLogsRequest(await readJsonBody(req), {
 *   sourceFile: 'mock://monitor/v1/logs',
 * });
 * ```
 */
export function parseOtlpLogsRequest(body: unknown, options: ParseOtlpLogsOptions): ParsedOtlpLogs {
  // Without a resourceLogs list there is nothing to read; the Monitor service rejects such bodies.
  if (!isJsonObject(body) || !Array.isArray(body.resourceLogs)) {
    return {
      records: [],
      issues: [{ path: 'resourceLogs', message: 'Expected a body with a resourceLogs list.' }],
    };
  }

  const result: ParsedOtlpLogs = { records: [], issues: [] };
  // Each entry is read independently so one malformed entry does not drop the rest of the batch.
  for (const [index, resourceLog] of body.resourceLogs.entries()) {
    const parsed = parseOtlpResourceLog(resourceLog, options, `resourceLogs[${index}]`);
    result.records.push(...parsed.records);
    result.issues.push(...parsed.issues);
  }
  return result;
}

export default parseOtlpLogsRequest;

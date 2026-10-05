import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

import { isJsonObject } from './is-json-object.js';
import { parseOtlpLogsRequest } from './parse-otlp-logs-request.js';
import { parseOtlpResourceLog } from './parse-otlp-resource-log.js';
import type { ParsedOtlpLogs } from './types.js';

/** File names read from a recordings folder: JSON Lines files, plain or gzipped. */
const RECORDING_FILE_PATTERN = /\.(?:jsonl|ndjson|json)(?:\.gz)?$/i;

/** Options for {@link readAnalyticsRecordings}. */
export interface ReadAnalyticsRecordingsOptions {
  /** Stored as `_ingest_ts` on every record. Defaults to the current time. */
  ingestedAt?: Date;
  /** Creates each record's `event_id`. Defaults to a random UUID. */
  createEventId?: () => string;
}

/**
 * Reads analytics recordings — JSON Lines files written by the analytics mock, or `logs_*.json.gz`
 * files from Fusion's analytics landing zone — into analytics records.
 *
 * @remarks
 * Each path may be a file or a folder; folders are searched recursively for `.jsonl`, `.ndjson`,
 * and `.json` files, each optionally gzipped. Gzipped content is detected by its header, so the
 * file name does not matter. Every non-empty line is one OpenTelemetry `ResourceLogs` entry; a
 * line holding a whole `POST /v1/logs` body (`{ "resourceLogs": [...] }`) is read too. Each
 * record's `_source_file` is the absolute path of its file.
 *
 * Lines that cannot be parsed, and entries the parser skips, are returned in `issues` with a
 * `file:line` path; the rest are still read.
 *
 * @param paths - Recording files or folders.
 * @param options - Ingest time and id generation for the records.
 * @returns The records in file and line order, and any skipped parts.
 * @throws {Error} When a path does not exist or cannot be read.
 *
 * @example
 * ```typescript
 * const { records, issues } = await readAnalyticsRecordings(['./recordings/analytics.jsonl']);
 * ```
 */
export async function readAnalyticsRecordings(
  paths: readonly string[],
  options: ReadAnalyticsRecordingsOptions = {},
): Promise<ParsedOtlpLogs> {
  const result: ParsedOtlpLogs = { records: [], issues: [] };
  const ingestedAt = options.ingestedAt ?? new Date();

  // Paths are read in the given order so seeded history is deterministic.
  for (const file of await resolveRecordingFiles(paths)) {
    const lines = decodeRecording(await readFile(file)).split(/\r?\n/);
    // Each line is read on its own so one corrupt line does not drop the file.
    for (const [index, line] of lines.entries()) {
      // Blank lines, including the trailing newline, carry no entry.
      if (!line.trim()) continue;
      const path = `${file}:${index + 1}`;

      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch (error) {
        result.issues.push({ path, message: `Invalid JSON: ${(error as Error).message}` });
        // The line is reported and skipped, and reading continues with the next line.
        continue;
      }

      const parseOptions = { sourceFile: file, ingestedAt, createEventId: options.createEventId };
      // Saved request bodies hold several entries; recordings and landing files hold one per line.
      const parsed =
        isJsonObject(value) && Array.isArray(value.resourceLogs)
          ? parseOtlpLogsRequest(value, parseOptions)
          : parseOtlpResourceLog(value, parseOptions, 'resourceLog');
      result.records.push(...parsed.records);
      // Issue paths are prefixed with the file and line so the problem can be found.
      result.issues.push(
        ...parsed.issues.map((issue) => ({ ...issue, path: `${path} ${issue.path}` })),
      );
    }
  }
  return result;
}

/**
 * Expands recording paths to the files to read.
 *
 * @param paths - Files or folders.
 * @returns Absolute file paths: given files as they are, folder contents sorted by path.
 */
async function resolveRecordingFiles(paths: readonly string[]): Promise<string[]> {
  const files: string[] = [];
  // Every path is resolved in order so callers control which history comes first.
  for (const path of paths) {
    const absolute = resolve(path);
    // A folder holds many recordings, such as a landing-zone export.
    if ((await stat(absolute)).isDirectory()) {
      const entries = await readdir(absolute, { recursive: true });
      files.push(
        ...entries
          // Only recording files are read from a folder; other files are ignored.
          .filter((entry) => RECORDING_FILE_PATTERN.test(entry))
          // Sorting keeps landing-zone folders (year=/month=/day=) in time order.
          .map((entry) => join(absolute, entry))
          .sort(),
      );
    } else {
      files.push(absolute);
    }
  }
  return files;
}

/**
 * Decodes a recording file's content, unzipping it when it starts with the gzip header.
 *
 * @param content - Raw file content.
 * @returns The text content.
 */
function decodeRecording(content: Buffer): string {
  const isGzip = content.length > 1 && content[0] === 0x1f && content[1] === 0x8b;
  return (isGzip ? gunzipSync(content) : content).toString('utf8');
}

export default readAnalyticsRecordings;

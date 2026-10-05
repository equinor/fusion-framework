import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { isJsonObject } from './is-json-object.js';
import { parseOtlpLogsRequest } from './parse-otlp-logs-request.js';
import { projectAnalyticsEvent } from './project-analytics-event.js';
import { readAnalyticsRecordings } from './read-analytics-recordings.js';
import type {
  AnalyticsEventRow,
  AnalyticsRecord,
  OtlpParseIssue,
  ParsedOtlpLogs,
} from './types.js';

/** `_source_file` of received events when no recording file is configured. */
const RECEIVED_SOURCE = 'mock://monitor/v1/logs';

/** Options for {@link AnalyticsStore}. */
export interface AnalyticsStoreOptions {
  /**
   * JSON Lines file every received `ResourceLogs` entry is appended to, one entry per line, in the
   * same format as Fusion's analytics landing zone. Created when missing; never rewritten.
   */
  record?: string;
  /**
   * Recordings loaded when the store is first used: JSON Lines files written through
   * {@link AnalyticsStoreOptions.record}, `logs_*.json.gz` landing-zone files, or folders of them.
   * Their events are visible to every session and survive {@link AnalyticsStore.reset}.
   */
  seed?: string | readonly string[];
  /** Receives warnings about recording lines and entries that could not be read. Defaults to `console.warn`. */
  warn?: (message: string) => void;
  /** Creates each record's `event_id`. Defaults to a random UUID. */
  createEventId?: () => string;
}

/** Who sent a batch, as resolved by the analytics mock from the request's mock-auth identity. */
export interface AnalyticsSender {
  /** Stamped on every entry as the `user.id` resource attribute, as the Monitor service does. */
  userId: string;
  /** Mock-auth browser session the events belong to, which keeps parallel tests apart. */
  sessionId: string;
}

/** One stored event: the raw record and its event-table row. */
interface StoredEvent {
  record: AnalyticsRecord;
  row: AnalyticsEventRow | undefined;
}

/**
 * In-memory store of the analytics the mock Monitor service has received, read the way Fusion's
 * analytics pipeline reads them, plus any seeded history.
 *
 * @remarks
 * Received events are kept per mock-auth browser session, so tests running at the same time do
 * not see each other's events. Seeded events are shared by every session. Every received entry is
 * also appended to the optional recording file, which can be loaded as a seed by a later run.
 * Call {@link AnalyticsStore.ready} before reading so seeds are loaded.
 *
 * @example
 * ```typescript
 * const store = new AnalyticsStore({ record: '.fusion/analytics.jsonl', seed: 'recordings' });
 * await store.ready();
 * const features = store.getRows(sessionId).filter((row) => row.event_name === 'app-feature');
 * ```
 */
export class AnalyticsStore {
  readonly #record: string | undefined;
  readonly #seed: readonly string[];
  readonly #warn: (message: string) => void;
  readonly #createEventId: (() => string) | undefined;
  #seeded: StoredEvent[] = [];
  #received = new Map<string, StoredEvent[]>();
  #loading: Promise<void> | undefined;
  #writes: Promise<void> = Promise.resolve();

  /**
   * Creates an empty store; seeds are loaded on first use.
   *
   * @param options - Recording file, seed recordings, and warning output.
   */
  constructor(options: AnalyticsStoreOptions = {}) {
    this.#record = options.record === undefined ? undefined : resolve(options.record);
    this.#seed = typeof options.seed === 'string' ? [options.seed] : [...(options.seed ?? [])];
    this.#warn = options.warn ?? ((message) => console.warn(message));
    this.#createEventId = options.createEventId;
  }

  /**
   * The recording file received entries are appended to.
   *
   * @returns The absolute path, or `undefined` when nothing is recorded.
   */
  get recordFile(): string | undefined {
    return this.#record;
  }

  /**
   * Loads the seed recordings once. Safe to call repeatedly and concurrently.
   *
   * @returns Resolves when seeded events can be read.
   * @throws {Error} When a seed path does not exist or cannot be read.
   */
  ready(): Promise<void> {
    this.#loading ??= this.#loadSeeds();
    return this.#loading;
  }

  /**
   * Stores one received `POST /v1/logs` batch for a sender: stamps `user.id` on each entry like
   * the Monitor service, appends the entries to the recording, and reads them into events.
   *
   * @param resourceLogs - The request's `resourceLogs` entries; each must be an object.
   * @param sender - Who sent the batch.
   * @returns The records read from the batch, and any skipped parts.
   * @throws {Error} When the recording file cannot be written.
   */
  async receive(
    resourceLogs: readonly Record<string, unknown>[],
    sender: AnalyticsSender,
  ): Promise<ParsedOtlpLogs> {
    await this.ready();
    // Each entry is stamped as the Monitor service does before storing it.
    const stamped = resourceLogs.map((entry) => stampUserId(entry, sender.userId));
    await this.#append(stamped);

    const parsed = parseOtlpLogsRequest(
      { resourceLogs: stamped },
      {
        sourceFile: this.#record ?? RECEIVED_SOURCE,
        createEventId: this.#createEventId,
      },
    );
    this.#reportIssues(parsed.issues);
    const events = this.#received.get(sender.sessionId) ?? [];
    // Rows are projected once on arrival so repeated reads stay cheap.
    events.push(...parsed.records.map(toStoredEvent));
    this.#received.set(sender.sessionId, events);
    return parsed;
  }

  /**
   * Returns analytics records in arrival order: seeded records first, then received ones.
   *
   * @param sessionId - Only include events received in this browser session. When omitted, events
   *   from every session are included.
   * @returns The raw (bronze) records.
   */
  getRecords(sessionId?: string): AnalyticsRecord[] {
    // Callers get the raw records without the cached rows.
    return this.#events(sessionId).map((event) => event.record);
  }

  /**
   * Returns the event-table rows of the stored analytics, as Fusion's analytics pipeline would
   * store them. Records without an event name are left out.
   *
   * @param sessionId - Only include events received in this browser session. When omitted, events
   *   from every session are included.
   * @returns The rows, seeded first, then received.
   */
  getRows(sessionId?: string): AnalyticsEventRow[] {
    return this.#events(sessionId).flatMap((event) => (event.row ? [event.row] : []));
  }

  /**
   * Removes every received event and keeps the seeded history. The recording file is not changed.
   */
  reset(): void {
    this.#received.clear();
  }

  /**
   * Selects stored events for a session, or every session.
   *
   * @param sessionId - Session to include, or `undefined` for all sessions.
   * @returns Seeded events followed by the selected received events.
   */
  #events(sessionId: string | undefined): StoredEvent[] {
    // A session sees shared history plus its own events; no session means a view of everything.
    const received =
      sessionId === undefined
        ? [...this.#received.values()].flat()
        : (this.#received.get(sessionId) ?? []);
    // Seeded history comes first, as it happened before this run.
    return [...this.#seeded, ...received];
  }

  /**
   * Reads every seed recording into the shared history.
   *
   * @returns Resolves when the seeds are stored.
   */
  async #loadSeeds(): Promise<void> {
    // Nothing to load keeps a store without seeds free of file system access.
    if (this.#seed.length === 0) return;
    const { records, issues } = await readAnalyticsRecordings(this.#seed, {
      createEventId: this.#createEventId,
    });
    this.#reportIssues(issues);
    // Seeded rows are projected once at load, like received ones.
    this.#seeded = records.map(toStoredEvent);
  }

  /**
   * Appends entries to the recording, one per line, in the order batches arrived.
   *
   * @param entries - Stamped `ResourceLogs` entries.
   * @returns Resolves when the entries are written.
   */
  #append(entries: readonly Record<string, unknown>[]): Promise<void> {
    const file = this.#record;
    // Without a recording file the events live only in memory.
    if (!file || entries.length === 0) return Promise.resolve();
    // One compact JSON line per entry, the landing-zone format.
    const lines = entries.map((entry) => `${JSON.stringify(entry)}\n`).join('');
    // Chaining keeps lines from concurrent requests whole and in arrival order.
    const write = this.#writes.then(async () => {
      await mkdir(dirname(file), { recursive: true });
      await appendFile(file, lines, 'utf8');
    });
    // A failed write must not block later writes; the caller still sees this failure.
    this.#writes = write.catch(() => undefined);
    return write;
  }

  /**
   * Forwards skipped parts to the warning output.
   *
   * @param issues - Issues reported while reading.
   */
  #reportIssues(issues: readonly OtlpParseIssue[]): void {
    // Each skipped part is reported so broken recordings and payloads are noticed.
    for (const issue of issues) {
      this.#warn(`[analytics] Skipped ${issue.path}: ${issue.message}`);
    }
  }
}

/**
 * Pairs a record with its event-table row so reads do not re-project.
 *
 * @param record - A parsed record.
 * @returns The stored event.
 */
function toStoredEvent(record: AnalyticsRecord): StoredEvent {
  return { record, row: projectAnalyticsEvent(record) };
}

/**
 * Appends the `user.id` resource attribute to a `ResourceLogs` entry, exactly as the Monitor
 * service does before storing it: the attribute is added after any existing ones, without
 * replacing a `user.id` the client may have sent.
 *
 * @param entry - A `ResourceLogs` entry.
 * @param userId - The sender's user id.
 * @returns A copy of the entry with the attribute appended.
 */
function stampUserId(entry: Record<string, unknown>, userId: string): Record<string, unknown> {
  const resource = isJsonObject(entry.resource) ? entry.resource : {};
  const attributes = Array.isArray(resource.attributes) ? resource.attributes : [];
  return {
    ...entry,
    resource: {
      ...resource,
      attributes: [...attributes, { key: 'user.id', value: { stringValue: userId } }],
    },
  };
}

export default AnalyticsStore;

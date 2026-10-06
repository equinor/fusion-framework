import type { MockControlRequest, MockControlResult } from '../../../../discovery/index.js';
import type { AnalyticsStore } from '../store/index.js';
import type { AnalyticsEventRow } from '../types.js';

/**
 * Answers the analytics control route `/@fusion-mock/analytics`, which tests use to read and clear
 * the analytics the mock Monitor service received.
 *
 * @remarks
 * - `GET` returns `{ events }`: the received event-table rows, oldest first. Query parameters
 *   `eventName`, `appKey`, and `feature` narrow the list; `includeSeeded=true` adds the seeded
 *   history first.
 * - `DELETE` removes received events and keeps the seeded history.
 *
 * Both act on the caller's mock-auth browser session when the request carries one, so parallel
 * tests stay apart; otherwise they act on every session. The `session` query parameter selects a
 * session explicitly, for example `local-development` for a browser without a selected user.
 *
 * @param store - The analytics store.
 * @param request - The control request.
 * @returns The JSON response.
 *
 * @example
 * ```typescript
 * definition.control = { analytics: (request) => handleAnalyticsControl(store, request) };
 * ```
 */
export async function handleAnalyticsControl(
  store: AnalyticsStore,
  request: MockControlRequest,
): Promise<MockControlResult> {
  const { method, query } = request;
  const sessionId = query.get('session') ?? request.sessionId;

  // Reading lists the session's events, optionally narrowed by the test's filters.
  if (method === 'GET') {
    await store.ready();
    const rows =
      query.get('includeSeeded') === 'true'
        ? store.getRows(sessionId)
        : store.getReceivedRows(sessionId);
    const eventName = query.get('eventName');
    const appKey = query.get('appKey');
    const feature = query.get('feature');
    // Each given filter must match; omitted filters match everything.
    const events = rows.filter(
      (row) =>
        (eventName === null || row.event_name === eventName) &&
        (appKey === null || readColumn(row, 'data_appkey') === appKey) &&
        (feature === null || readColumn(row, 'data_feature') === feature),
    );
    return { status: 200, body: { events } };
  }

  // Clearing lets each test start without the events of the one before.
  if (method === 'DELETE') {
    store.clear(sessionId);
    return { status: 200, body: { status: 'cleared' } };
  }

  return { status: 405, body: { error: `Method ${method} is not supported; use GET or DELETE.` } };
}

/**
 * Reads a promoted column that only some event tables have.
 *
 * @param row - Any event row.
 * @param column - The column name.
 * @returns The value, or `undefined` when the row's table has no such column.
 */
function readColumn(row: AnalyticsEventRow, column: string): unknown {
  // Rows are plain objects; a missing column reads as undefined, which no filter value equals.
  return (row as unknown as Record<string, unknown>)[column];
}

export default handleAnalyticsControl;

import type { AnalyticsEventRow } from '../types.js';

interface MockAnalyticsResponse {
  ok(): boolean;
  status(): number;
  json(): Promise<unknown>;
}

/**
 * Request client used to read and clear analytics on a Fusion mock server.
 *
 * @remarks
 * Playwright's `APIRequestContext` (`context.request`) satisfies this contract directly. Use the
 * request client of the browser context under test: when it carries a mock-auth session — after
 * `createMockAuth().setUser()` — only that session's events are read and cleared.
 */
export interface MockAnalyticsRequestClient {
  /** Sends a GET request through the client's cookie jar. */
  get(url: string): Promise<MockAnalyticsResponse>;
  /** Sends a DELETE request through the client's cookie jar. */
  delete(url: string): Promise<MockAnalyticsResponse>;
}

/** Narrows which analytics events are read. Every given field must match. */
export interface MockAnalyticsFilter {
  /** OpenTelemetry event name, for example `app-feature`. */
  eventName?: string;
  /** App key of the event (`data_appkey`). */
  appKey?: string;
  /** Feature name of an `app-feature` event (`data_feature`). */
  feature?: string;
  /** Mock-auth session to read, such as `local-development`, instead of the request client's own. */
  session?: string;
}

/** Options for {@link createMockAnalytics}'s `waitFor`. */
export interface WaitForMockAnalyticsOptions extends MockAnalyticsFilter {
  /** Further check on a candidate event, for example on `data_body_data`. */
  match?: (event: AnalyticsEventRow) => boolean;
  /** How long to wait, in milliseconds. Defaults to 10 000, which covers the analytics batch delay. */
  timeout?: number;
  /** How often to check, in milliseconds. Defaults to 100. */
  interval?: number;
}

/**
 * Creates a client for checking the analytics a Fusion app sent to a mock server, so Playwright
 * tests can assert that features are tracked with the right data.
 *
 * @remarks
 * Works with a mock server that serves `defineAnalyticsMock` — which `ffc mock-server` does by
 * default. Events are the rows Fusion's analytics pipeline stores, so an `app-feature` event from
 * `useTrackFeature('page-viewed', { route })` has `data_feature: 'page-viewed'` and
 * `data_body_data: '{"route":"…"}'`. Seeded history is never returned.
 *
 * The framework sends analytics in batches about a second apart, so use `waitFor` rather than
 * reading once right after an action.
 *
 * @param mockServerUrl - Mock server origin, for example `http://localhost:4010`.
 * @returns Helpers that list, wait for, and reset the analytics of one request client's session.
 * @throws From the helpers, when the mock server rejects a request or serves no analytics.
 *
 * @example Playwright
 * ```typescript
 * const analytics = createMockAnalytics('http://localhost:4010');
 *
 * test.beforeEach(async ({ context }) => analytics.reset(context.request));
 *
 * test('tracks page views', async ({ context, page }) => {
 *   await page.goto('/apps/my-app/people');
 *   const event = await analytics.waitFor(context.request, { feature: 'page-viewed' });
 *   expect(JSON.parse(event.data_body_data ?? '{}')).toEqual({ route: '/people' });
 * });
 * ```
 */
export function createMockAnalytics(mockServerUrl: string): {
  list(
    request: MockAnalyticsRequestClient,
    filter?: MockAnalyticsFilter,
  ): Promise<AnalyticsEventRow[]>;
  waitFor(
    request: MockAnalyticsRequestClient,
    options: WaitForMockAnalyticsOptions,
  ): Promise<AnalyticsEventRow>;
  reset(
    request: MockAnalyticsRequestClient,
    filter?: Pick<MockAnalyticsFilter, 'session'>,
  ): Promise<void>;
} {
  /**
   * Builds the control URL with the given filters as query parameters.
   *
   * @param filter - Filters to include.
   * @returns The URL.
   */
  const controlUrl = (filter: MockAnalyticsFilter = {}): string => {
    const url = new URL('/@fusion-mock/analytics', mockServerUrl);
    // Only given filters are sent, so omitted ones match everything.
    for (const [key, value] of Object.entries(filter)) {
      // Undefined filters are left out of the query string.
      if (typeof value === 'string') url.searchParams.set(key, value);
    }
    return url.href;
  };

  /**
   * Rejects unsuccessful control-plane responses.
   *
   * @param action - Operation being attempted.
   * @param response - Response from the caller's request client.
   */
  const assertSuccessful = (action: string, response: MockAnalyticsResponse): void => {
    // A 404 means the server has no analytics mock; say so instead of returning empty results.
    if (response.status() === 404) {
      throw new Error(`Failed to ${action}: the mock server does not serve analytics`);
    }
    // Surface other failures instead of returning success-shaped state.
    if (!response.ok()) {
      throw new Error(`Failed to ${action}: mock server returned ${response.status()}`);
    }
  };

  /**
   * Reads matching events.
   *
   * @param request - Request client.
   * @param filter - Filters.
   * @returns The events, oldest first.
   */
  const list = async (
    request: MockAnalyticsRequestClient,
    filter: MockAnalyticsFilter = {},
  ): Promise<AnalyticsEventRow[]> => {
    const { eventName, appKey, feature, session } = filter;
    const response = await request.get(controlUrl({ eventName, appKey, feature, session }));
    assertSuccessful('read analytics', response);
    return ((await response.json()) as { events: AnalyticsEventRow[] }).events;
  };

  return {
    list,
    async waitFor(request, options): Promise<AnalyticsEventRow> {
      const { match, timeout = 10_000, interval = 100, ...filter } = options;
      const deadline = Date.now() + timeout;
      // Poll until a matching event arrives, since the framework sends analytics in batches.
      while (true) {
        const events = await list(request, filter);
        // Without a match function, any event that passed the server-side filters will do.
        const found = match ? events.find(match) : events[0];
        // The first matching event ends the wait.
        if (found) return found;
        // Give up once the time limit has passed, explaining what did arrive.
        if (Date.now() >= deadline) break;
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      const received = await list(request, { session: filter.session });
      const summary = received
        // Feature names identify app-feature events; other events are named by their event name.
        .map((event) => ('data_feature' in event && event.data_feature) || event.event_name)
        .join(', ');
      throw new Error(
        `Timed out after ${timeout}ms waiting for an analytics event matching ${JSON.stringify(filter)}${match ? ' and the match function' : ''}. Received ${received.length} event(s)${summary ? `: ${summary}` : ''}.`,
      );
    },
    async reset(request, filter = {}): Promise<void> {
      const response = await request.delete(controlUrl({ session: filter.session }));
      assertSuccessful('reset analytics', response);
    },
  };
}

export default createMockAnalytics;

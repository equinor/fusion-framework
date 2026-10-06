/** A control-plane request routed to a service's {@link MockControlHandler}. */
export interface MockControlRequest {
  /** Upper-case HTTP method. */
  method: string;
  /** Query parameters of the control request. */
  query: URLSearchParams;
  /**
   * The caller's mock-auth browser session, when the request carries a session cookie with a
   * selected user — for example Playwright's `context.request` after `createMockAuth().setUser()`.
   */
  sessionId?: string;
}

/** The JSON response a {@link MockControlHandler} returns. */
export interface MockControlResult {
  /** HTTP status code. */
  status: number;
  /** JSON response body. */
  body?: unknown;
}

/**
 * Handles a control-plane request at `/@fusion-mock/<name>` for a service, so tests can inspect or
 * clear state the service keeps, such as recorded analytics.
 */
export type MockControlHandler = (
  request: MockControlRequest,
) => MockControlResult | Promise<MockControlResult>;

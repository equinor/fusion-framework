/**
 * The subset of an Express-style response object {@link MockExpressResponse}
 * implements, and every handler passed to `fromExpressStyleHandler` can call.
 *
 * @remarks
 * Deliberately loose — `openapi-backend`'s handlers, Express's own, and most
 * Connect-style middleware call only these, chained the same way
 * `res.status(200).json(body)` is everywhere.
 */
export interface ExpressStyleResponse {
  status(code: number): this;
  setHeader(name: string, value: string): this;
  json(body: unknown): this;
  send(body?: unknown): this;
  end(body?: unknown): this;
}

/**
 * A minimal, spec-compliant stand-in for an Express `res` object, capturing
 * one of `.json`/`.send`/`.end` as a Fetch API `Response`.
 *
 * @remarks
 * This is what lets `fromExpressStyleHandler` hand an Express-style handler
 * something it already knows how to answer — `res.status(200).json(body)` —
 * while the middleware chain around it only ever sees `Response`.
 *
 * Resolves {@link done} the first time a terminal method is called; later
 * calls are ignored, matching how a real response can only be sent once.
 */
export class MockExpressResponse implements ExpressStyleResponse {
  #status = 200;
  #headers = new Headers();
  #resolve!: (response: Response) => void;
  #settled = false;

  /** Resolves with the `Response` built from whichever terminal method was called. */
  public readonly done: Promise<Response>;

  /** Creates a response whose promise settles when a terminal method is called. */
  constructor() {
    this.done = new Promise<Response>((resolve) => {
      this.#resolve = resolve;
    });
  }

  /**
   * Sets the response status code.
   * @param code - The HTTP status code.
   * @returns This response, for chaining.
   */
  public status(code: number): this {
    this.#status = code;
    return this;
  }

  /**
   * Sets a response header.
   * @param name - The header name.
   * @param value - The header value.
   * @returns This response, for chaining.
   */
  public setHeader(name: string, value: string): this {
    this.#headers.set(name, value);
    return this;
  }

  /**
   * Sends a JSON body, setting `Content-Type` and resolving {@link done}.
   * @param body - The value to serialize.
   * @returns This response, for chaining.
   */
  public json(body: unknown): this {
    this.#headers.set('content-type', 'application/json');
    this.#settle(JSON.stringify(body));
    return this;
  }

  /**
   * Sends a body as-is, resolving {@link done}.
   * @param body - The body to send.
   * @returns This response, for chaining.
   */
  public send(body?: unknown): this {
    // Serialize non-string values so callers receive a valid JSON response body.
    if (body !== undefined && typeof body !== 'string') {
      this.#headers.set('content-type', 'application/json');
      this.#settle(JSON.stringify(body));
    } else {
      this.#settle(body ?? null);
    }
    return this;
  }

  /**
   * Ends the response, optionally with a body, resolving {@link done}.
   * @param body - The optional body to send.
   * @returns This response, for chaining.
   */
  public end(body?: unknown): this {
    this.#settle(typeof body === 'string' || body === undefined ? (body ?? null) : String(body));
    return this;
  }

  /**
   * Resolves the response once, ignoring later terminal calls.
   * @param body - The response body to include.
   */
  #settle(body: BodyInit | null): void {
    // A response can only be completed once, like a real Express response.
    if (this.#settled) return;
    this.#settled = true;
    this.#resolve(new Response(body, { status: this.#status, headers: this.#headers }));
  }
}

export default MockExpressResponse;

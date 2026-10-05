/** Request options the help panel passes to the Fusion HTTP client. */
export interface HelpServiceRequestInit {
  /** HTTP method; `GET` when omitted. */
  readonly method?: 'GET' | 'POST';
  /** JSON body; serialized by the Fusion HTTP client. */
  readonly body?: object;
  /** Aborts the request when the panel moves on. */
  readonly signal?: AbortSignal;
}

/** The part of the service discovery provider the help panel needs, so no extra dependency is required. */
export interface HelpServiceDiscovery {
  /** Lists discovered services; rejects when the discovery request itself fails. */
  resolveServices(): Promise<readonly { readonly key: string }[]>;
  /** Creates an HTTP client for a discovered service; rejects when the key is not discovered. */
  createClient(name: string): Promise<{
    json<T>(path: string, init?: HelpServiceRequestInit): Promise<T>;
  }>;
}

/** Service-discovery key of the Fusion Help service. */
const HELP_SERVICE_KEY = 'help';

/**
 * Outcome of one help service request, split so the panel can tell a missing article from a
 * missing `help` service (no help docs served) and from other failures.
 *
 * @template T - Parsed response body.
 */
export type HelpServiceResult<T> =
  | { readonly status: 'loaded'; readonly data: T }
  | { readonly status: 'not-found' }
  | { readonly status: 'unavailable'; readonly message: string }
  | { readonly status: 'error'; readonly message: string };

/**
 * Reads the HTTP status from a Fusion HTTP client error without depending on its class.
 *
 * @param error - Error thrown by `HttpClient.json`.
 * @returns The response status, if the error carries a response.
 */
const getResponseStatus = (error: unknown): number | undefined => {
  const response = (error as { response?: { status?: unknown } } | null)?.response;
  return typeof response?.status === 'number' ? response.status : undefined;
};

/**
 * Reads the service's own error message from a failed response body: the Fusion API error
 * envelope (`{ error: { message } }`) or the mock server's `{ error: string }`.
 *
 * @param error - Error thrown by `HttpClient.json`, carrying the parsed body as `data`.
 * @returns The body's message, if any.
 */
const getBodyMessage = (error: unknown): string | undefined => {
  const body = (error as { data?: { error?: unknown } } | null)?.data?.error;
  // The mock server reports failures (e.g. malformed frontmatter) as a plain string.
  if (typeof body === 'string') return body;
  const message = (body as { message?: unknown } | undefined)?.message;
  return typeof message === 'string' ? message : undefined;
};

/**
 * Converts an unknown thrown value to a readable message, preferring the service's own message.
 *
 * @param error - Thrown value.
 * @returns The response body's message, the error message, or a string form of the value.
 */
const toMessage = (error: unknown): string =>
  getBodyMessage(error) ?? (error instanceof Error ? error.message : String(error));

/**
 * Sends a request to the `help` service in service discovery — the local mock served by
 * `ffc mock-server` from a help docs folder, or the real Help service — and classifies the result.
 *
 * `unavailable` is reserved for a discovery response that has no `help` entry. A failing discovery
 * request (network, authentication, or server error) is reported as `error`.
 *
 * @template T - Parsed response body.
 * @param serviceDiscovery - The portal's service discovery provider.
 * @param path - Help service-relative path, including any query.
 * @param init - Method, JSON body, and abort signal; a plain `GET` by default.
 * @returns The parsed body, or the reason it could not be loaded. Never rejects.
 *
 * @example
 * ```typescript
 * const result = await requestHelpService<HelpArticle>(serviceDiscovery, '/articles/intro', { signal });
 * if (result.status === 'loaded') console.log(result.data.title);
 * ```
 */
export async function requestHelpService<T>(
  serviceDiscovery: HelpServiceDiscovery,
  path: string,
  init: HelpServiceRequestInit,
): Promise<HelpServiceResult<T>> {
  let client: Awaited<ReturnType<HelpServiceDiscovery['createClient']>>;
  try {
    // createClient rejects both for a missing key and for discovery failures, so check the key first.
    const services = await serviceDiscovery.resolveServices();
    // Look for the help entry by key; the discovery list holds every platform service.
    const hasHelp = services.some((service) => service.key === HELP_SERVICE_KEY);
    // Only a successful discovery response without `help` means help content is not configured.
    if (!hasHelp) {
      return {
        status: 'unavailable',
        message: `No "${HELP_SERVICE_KEY}" service in service discovery.`,
      };
    }
    client = await serviceDiscovery.createClient(HELP_SERVICE_KEY);
  } catch (error) {
    // Network, authentication, and server failures are errors, not missing configuration.
    return { status: 'error', message: toMessage(error) };
  }
  try {
    return { status: 'loaded', data: await client.json<T>(path, init) };
  } catch (error) {
    // A 404 is the expected "wrong or renamed slug" case that tests assert on.
    if (getResponseStatus(error) === 404) return { status: 'not-found' };
    return { status: 'error', message: toMessage(error) };
  }
}

export default requestHelpService;

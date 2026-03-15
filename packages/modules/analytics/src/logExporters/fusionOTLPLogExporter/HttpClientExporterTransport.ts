import type { IExporterTransport, ExportResponse } from '@opentelemetry/otlp-exporter-base';

import type { IHttpClient } from '@equinor/fusion-framework-module-http';

/**
 * Checks whether a failed HTTP status code is eligible for automatic retry.
 *
 * @param statusCode - HTTP response status code.
 * @returns `true` for 429, 502, 503, and 504.
 */
function isExportRetryable(statusCode: number): boolean {
  // Status codes of when we should consider retrying.
  // 429 Too Many Requests
  // 502 Bad Gateway
  // 503 Service Unavailable
  // 504 Gateway Timeout
  const retryCodes = [429, 502, 503, 504];
  return retryCodes.includes(statusCode);
}

/**
 * Parses an HTTP `Retry-After` header value into milliseconds.
 *
 * @param retryAfter - Raw header value (integer seconds or HTTP-date).
 * @returns Delay in milliseconds, `-1` for non-positive integers, or `undefined` if absent.
 */
function parseRetryAfterToMills(retryAfter?: string | undefined | null): number | undefined {
  if (retryAfter == null) {
    return undefined;
  }

  const seconds = Number.parseInt(retryAfter, 10);
  if (Number.isInteger(seconds)) {
    return seconds > 0 ? seconds * 1000 : -1;
  }
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After#directives
  const delay = new Date(retryAfter).getTime() - Date.now();

  if (delay >= 0) {
    return delay;
  }
  return 0;
}

/**
 * OpenTelemetry exporter transport that posts serialised log records using a
 * Fusion `IHttpClient`.
 *
 * @remarks
 * Implements `IExporterTransport` from `@opentelemetry/otlp-exporter-base`.
 * The transport honours the exporter’s timeout via `AbortController` and
 * inspects response status codes to report retryable failures (429, 502–504).
 *
 * @example
 * ```ts
 * const transport = new HttpClientExporterTransport(httpClient, '/v1/logs');
 * ```
 */
export class HttpClientExporterTransport implements IExporterTransport {
  /**
   * @param httpClient - Fusion HTTP client for outgoing requests.
   * @param path - URL path appended to the client’s base URL (default `'/v1/logs'`).
   */
  constructor(
    private httpClient: IHttpClient,
    private path: string = '/v1/logs',
  ) {}

  /**
   * Sends serialised log record data to the configured endpoint.
   *
   * @param data - Serialised OTLP payload as a `Uint8Array`.
   * @param timeoutMillis - Maximum time in milliseconds before the request is aborted.
   * @returns An `ExportResponse` indicating success, retryable failure, or permanent failure.
   */
  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMillis);

    try {
      const response = await this.httpClient.fetch(this.path, {
        method: 'POST',
        body: new Blob([data.slice().buffer], { type: 'application/json' }),
        signal: abortController.signal,
      });

      if (response.ok) {
        return { status: 'success' };
      } else if (isExportRetryable(response.status)) {
        const retryAfter = response.headers.get('Retry-After');
        const retryInMillis = parseRetryAfterToMills(retryAfter);
        return { status: 'retryable', retryInMillis };
      }
      return {
        status: 'failure',
        error: new Error('Fetch request failed with non-retryable status'),
      };
    } catch (error) {
      const err = error as Error;
      if (err?.name === 'AbortError') {
        return {
          status: 'failure',
          error: new Error('Fetch request timed out', { cause: err }),
        };
      }
      return {
        status: 'failure',
        error: new Error('Fetch request errored', { cause: err }),
      };
    } finally {
      clearTimeout(timeout);
    }
  }
  /** No-op; the HTTP client does not hold persistent connections. */
  shutdown(): void {
    // intentionally left empty, nothing to do.
  }
}

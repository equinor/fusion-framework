import type { IExporterTransport, ExportResponse } from '@opentelemetry/otlp-exporter-base';

import type { IHttpClient } from '@equinor/fusion-framework-react/http';

function isExportRetryable(statusCode: number): boolean {
  const retryCodes = [429, 502, 503, 504];
  return retryCodes.includes(statusCode);
}

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

export class HttpClientExporterTransport implements IExporterTransport {
  constructor(
    private httpClient: IHttpClient,
    private path: string = '/v1/logs',
  ) {}

  async send(data: Uint8Array, timeoutMillis: number): Promise<ExportResponse> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMillis);

    try {
      const response = await this.httpClient.fetch(this.path, {
        method: 'POST',
        body: new Blob([data.slice().buffer], { type: 'application/json' }),
        signal: abortController.signal,
      });

      if (response.status >= 200 && response.status <= 299) {
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
  shutdown(): void {
    // intentionally left empty, nothing to do.
  }
}

import type { WidgetErrorType } from '../WidgetManifestLoadError.js';

/**
 * Error thrown when a widget configuration cannot be loaded from the backend API.
 *
 * Use the static {@link fromHttpResponse} factory to create instances from
 * HTTP responses with appropriate type mapping.
 */
export class WidgetConfigLoadError extends Error {
  /**
   * Creates a `WidgetConfigLoadError` from an HTTP `Response`.
   *
   * Maps HTTP 401 to `'unauthorized'`, 404 to `'not_found'`, and all other
   * status codes to `'unknown'`.
   *
   * @param response - The failing HTTP response.
   * @param options - Standard `ErrorOptions` (e.g., `cause`).
   * @returns A typed `WidgetConfigLoadError`.
   */
  static fromHttpResponse(response: Response, options?: ErrorOptions) {
    // Map known status codes to a specific error type, otherwise fall through to 'unknown'
    switch (response.status) {
      case 401:
        return new WidgetConfigLoadError(
          'unauthorized',
          'failed to load widget config, request not authorized',
          options,
        );
      case 404:
        return new WidgetConfigLoadError('not_found', 'widget config not found', options);
    }
    return new WidgetConfigLoadError(
      'unknown',
      `failed to load widget config, status code ${response.status}`,
      options,
    );
  }
  /**
   * @param type - Error category discriminator.
   * @param message - Human-readable error description.
   * @param options - Standard `ErrorOptions` (e.g., `cause`).
   */
  constructor(
    public readonly type: WidgetErrorType,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'GetWidgetLoadConfigError';
  }
}

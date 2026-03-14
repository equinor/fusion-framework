/**
 * Discriminator for categorizing widget HTTP errors.
 *
 * - `'not_found'` — HTTP 404
 * - `'unauthorized'` — HTTP 401
 * - `'unknown'` — any other error
 */
type WidgetErrorType = 'not_found' | 'unauthorized' | 'unknown';

/**
 * Error thrown when a widget manifest cannot be loaded from the backend API.
 *
 * Use the static {@link fromHttpResponse} factory to create instances from
 * HTTP responses with appropriate type mapping.
 */
export class WidgetManifestLoadError extends Error {
  /**
   * Creates a `WidgetManifestLoadError` from an HTTP `Response`.
   *
   * Maps HTTP 401 to `'unauthorized'`, 404 to `'not_found'`, and all other
   * status codes to `'unknown'`.
   *
   * @param response - The failing HTTP response.
   * @param options - Standard `ErrorOptions` (e.g., `cause`).
   * @returns A typed `WidgetManifestLoadError`.
   */
  static fromHttpResponse(response: Response, options?: ErrorOptions) {
    switch (response.status) {
      case 401:
        return new WidgetManifestLoadError(
          'unauthorized',
          'failed to load widget manifest, request not authorized',
          options,
        );
      case 404:
        return new WidgetManifestLoadError('not_found', 'widget manifest not found', options);
    }
    return new WidgetManifestLoadError(
      'unknown',
      `failed to load widget manifest, status code ${response.status}`,
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
    this.name = 'GetWidgetLoadManifestErrors';
  }
}

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

/**
 * Error thrown when a widget script module cannot be dynamically imported.
 */
export class WidgetScriptModuleError extends Error {
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
    this.name = 'WidgetScriptModuleError';
  }
}

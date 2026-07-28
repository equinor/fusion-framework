import type { AppErrorType } from './app-error-type';

/**
 * Represents an error that occurs in the application configuration.
 */
export class AppConfigError extends Error {
  /**
   * Creates an instance of `AppConfigError` based on the HTTP response status.
   * @param response The HTTP response.
   * @param options Additional error options.
   * @returns An instance of `AppConfigError` based on the HTTP response status.
   */
  static fromHttpResponse(response: Response, options?: ErrorOptions): AppConfigError {
    // map well-known HTTP statuses to a specific error type
    switch (response.status) {
      case 401:
        return new AppConfigError(
          'unauthorized',
          'failed to load application config, request not authorized',
          options,
        );
      case 404:
        return new AppConfigError('not_found', 'application config not found', options);
      case 410:
        return new AppConfigError('deleted', 'application config deleted', options);
    }
    return new AppConfigError(
      'unknown',
      `failed to load application config, status code ${response.status}`,
      options,
    );
  }

  /**
   * Creates an instance of `AppConfigError`.
   * @param type The type of the application error.
   * @param message The error message.
   * @param options Additional error options.
   */
  constructor(
    public readonly type: AppErrorType,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

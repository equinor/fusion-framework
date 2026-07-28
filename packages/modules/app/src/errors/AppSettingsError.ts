import type { AppErrorType } from './app-error-type';

/**
 * Represents an error that occurs while fetching application settings.
 */
export class AppSettingsError extends Error {
  /**
   * Creates an instance of `AppSettingsError` based on the HTTP response status.
   * @param response The HTTP response.
   * @param options Additional error options.
   * @returns An instance of `AppSettingsError` based on the HTTP response status.
   */
  static fromHttpResponse(response: Response, options?: ErrorOptions): AppSettingsError {
    // map well-known HTTP statuses to a specific error type
    switch (response.status) {
      case 401:
        return new AppSettingsError(
          'unauthorized',
          'failed to load application settings, request not authorized',
          options,
        );
      case 404:
        return new AppSettingsError('not_found', 'application not found', options);
      case 410:
        return new AppSettingsError('deleted', 'application settings deleted', options);
    }
    return new AppSettingsError(
      'unknown',
      `failed to load application settings, status code ${response.status}`,
      options,
    );
  }

  /**
   * Creates an instance of `AppSettingsError`.
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

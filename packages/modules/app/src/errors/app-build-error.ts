import type { AppErrorType } from './app-error-type';

/**
 * Represents an error that occurs in the application build.
 */
export class AppBuildError extends Error {
  /**
   * Creates an instance of `AppBuildError` based on the HTTP response status.
   * @param response The HTTP response.
   * @param options Additional error options.
   * @returns An instance of `AppBuildError` based on the HTTP response status.
   */
  static fromHttpResponse(response: Response, options?: ErrorOptions): AppBuildError {
    // map well-known HTTP statuses to a specific error type
    switch (response.status) {
      case 401:
        return new AppBuildError(
          'unauthorized',
          'failed to load application build metadata, request not authorized',
          options,
        );
      case 404:
        return new AppBuildError('not_found', 'application build metadata not found', options);
      case 410:
        return new AppBuildError('deleted', 'application build deleted', options);
    }
    return new AppBuildError(
      'unknown',
      `failed to load application build, status code ${response.status}`,
      options,
    );
  }

  /**
   * Creates an instance of `AppBuildError`.
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

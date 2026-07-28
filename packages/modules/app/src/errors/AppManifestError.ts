import type { AppErrorType } from './app-error-type';

/**
 * Represents an error that occurs when loading an application manifest.
 */
export class AppManifestError extends Error {
  /**
   * Creates an instance of AppManifestError based on the HTTP response status.
   * @param response The HTTP response.
   * @param options Optional error options.
   * @returns An instance of AppManifestError.
   */
  static fromHttpResponse(response: Response, options?: ErrorOptions) {
    // map well-known HTTP statuses to a specific error type
    switch (response.status) {
      case 401:
        return new AppManifestError(
          'unauthorized',
          'failed to load application manifest, request not authorized',
          options,
        );
      case 404:
        return new AppManifestError('not_found', 'application manifest not found', options);
      case 410:
        return new AppManifestError('deleted', 'application manifest deleted', options);
    }
    return new AppManifestError(
      'unknown',
      `failed to load application manifest, status code ${response.status}`,
      options,
    );
  }

  /**
   * Creates an instance of AppManifestError.
   * @param type The type of the error.
   * @param message The error message.
   * @param options Optional error options.
   */
  constructor(
    public readonly type: AppErrorType,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

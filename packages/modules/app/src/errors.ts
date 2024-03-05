type AppErrorType = 'not_found' | 'unauthorized' | 'unknown';

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
        switch (response.status) {
            case 401:
                return new AppManifestError(
                    'unauthorized',
                    'failed to load application manifest, request not authorized',
                    options,
                );
            case 404:
                return new AppManifestError('not_found', 'application manifest not found', options);
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
        switch (response.status) {
            case 401:
                return new AppConfigError(
                    'unauthorized',
                    'failed to load application config, request not authorized',
                    options,
                );
            case 404:
                return new AppConfigError('not_found', 'application config not found', options);
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

/**
 * Represents an error that occurs when loading the application script.
 */
export class AppScriptModuleError extends Error {
    /**
     * Creates a new instance of the AppScriptModuleError class.
     * @param type The type of the error.
     * @param message The error message.
     * @param options Additional options for the error.
     */
    constructor(
        public readonly type: AppErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

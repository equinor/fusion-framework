type AppErrorType = 'not_found' | 'unauthorized' | 'unknown';

export class AppManifestError extends Error {
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
    constructor(
        public readonly type: AppErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

export class AppConfigError extends Error {
    static fromHttpResponse(response: Response, options?: ErrorOptions) {
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
    constructor(
        public readonly type: AppErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

export class AppScriptModuleError extends Error {
    constructor(
        public readonly type: AppErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}

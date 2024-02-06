type WidgetErrorType = 'not_found' | 'unauthorized' | 'unknown';

export class GetWidgetLoadManifestError extends Error {
    static fromHttpResponse(response: Response, options?: ErrorOptions) {
        switch (response.status) {
            case 401:
                return new GetWidgetLoadManifestError(
                    'unauthorized',
                    'failed to load widget manifest, request not authorized',
                    options,
                );
            case 404:
                return new GetWidgetLoadManifestError(
                    'not_found',
                    'widget manifest not found',
                    options,
                );
        }
        return new GetWidgetLoadManifestError(
            'unknown',
            `failed to load widget manifest, status code ${response.status}`,
            options,
        );
    }
    constructor(
        public readonly type: WidgetErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = 'GetWidgetLoadManifestErrors';
    }
}

export class GetWidgetLoadConfigError extends Error {
    static fromHttpResponse(response: Response, options?: ErrorOptions) {
        switch (response.status) {
            case 401:
                return new GetWidgetLoadConfigError(
                    'unauthorized',
                    'failed to load widget config, request not authorized',
                    options,
                );
            case 404:
                return new GetWidgetLoadConfigError(
                    'not_found',
                    'widget config not found',
                    options,
                );
        }
        return new GetWidgetLoadConfigError(
            'unknown',
            `failed to load widget config, status code ${response.status}`,
            options,
        );
    }
    constructor(
        public readonly type: WidgetErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = 'GetWidgetLoadConfigError';
    }
}

export class WidgetScriptModuleError extends Error {
    constructor(
        public readonly type: WidgetErrorType,
        message?: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = WidgetScriptModuleError.toString();
    }
}

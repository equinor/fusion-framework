type WidgetErrorType = 'not_found' | 'unauthorized' | 'unknown';

export class WidgetManifestLoadError extends Error {
    static fromHttpResponse(response: Response, options?: ErrorOptions) {
        switch (response.status) {
            case 401:
                return new WidgetManifestLoadError(
                    'unauthorized',
                    'failed to load widget manifest, request not authorized',
                    options,
                );
            case 404:
                return new WidgetManifestLoadError(
                    'not_found',
                    'widget manifest not found',
                    options,
                );
        }
        return new WidgetManifestLoadError(
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

export class WidgetConfigLoadError extends Error {
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
        this.name = 'WidgetScriptModuleError';
    }
}

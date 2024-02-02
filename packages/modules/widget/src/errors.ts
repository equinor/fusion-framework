type WidgetErrorType = 'not_found' | 'unauthorized' | 'unknown';

export class GetWidgetManifestError extends Error {
    static fromHttpResponse(response: Response, options?: ErrorOptions) {
        switch (response.status) {
            case 401:
                return new GetWidgetManifestError(
                    'unauthorized',
                    'failed to load widget manifest, request not authorized',
                    options,
                );
            case 404:
                return new GetWidgetManifestError(
                    'not_found',
                    'widget manifest not found',
                    options,
                );
        }
        return new GetWidgetManifestError(
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
    }
}

export class GetWidgetConfigError extends Error {
    static fromHttpResponse(response: Response, options?: ErrorOptions) {
        switch (response.status) {
            case 401:
                return new GetWidgetManifestError(
                    'unauthorized',
                    'failed to load widget config, request not authorized',
                    options,
                );
            case 404:
                return new GetWidgetManifestError('not_found', 'widget config not found', options);
        }
        return new GetWidgetManifestError(
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

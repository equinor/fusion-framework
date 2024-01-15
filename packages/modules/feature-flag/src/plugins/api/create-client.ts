import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ApiResponseSelector, IApiPluginClient } from './types';

/**
 * Produces an api plugin client.
 *
 * @example
 * ```ts
 * const httpProvider = await configArgs.requireInstance('http');
 * const httpClient = httpProvider.createClient(httpClientName);
 * const apiClient = createApiPluginClient({ httpClient, path, selector });
 * return new ApiPlugin(apiClient);
 * ```
 */
export const createApiPluginClient = (args: {
    httpClient: IHttpClient;
    /** Relatice HTTP client path */
    path: string;
    selector: ApiResponseSelector;
}): IApiPluginClient => {
    const { httpClient, path, selector } = args;

    return {
        getFeatureFlags: () => {
            return httpClient.fetch$(path, { selector });
        },
    };
};

export default createApiPluginClient;

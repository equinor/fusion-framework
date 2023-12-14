import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ApiResponseSelector, IApiPluginClient } from './types';

export const createApiPluginClient = (args: {
    httpClient: IHttpClient;
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

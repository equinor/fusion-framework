import type { ApiFeatureFlagPlugin, ApiResponseSelector } from './types';
import { IFeatureFlag, FeatureFlag } from '../../FeatureFlag';
import { FeatureFlagPluginConfigCallback } from '../../types';
import { createApiPluginClient } from './create-client';
import { ApiPlugin } from './plugin';

const defaultSelector: ApiResponseSelector = async (response: Response) => {
    const flags = (await response.json()) as IFeatureFlag[];

    return flags.map((flag) => {
        return new FeatureFlag(flag.key, {
            enabled: !!flag.enabled,
            value: flag.value,
            title: flag.title,
            description: flag.description,
            source: flag.source,
            readonly: true,
        });
    });
};

export const createApiPlugin = (args: {
    httpClientName: string;
    path: string;
    selector?: ApiResponseSelector;
}): FeatureFlagPluginConfigCallback<ApiFeatureFlagPlugin> => {
    return async (configArgs) => {
        const { httpClientName, path, selector = defaultSelector } = args;

        if (!configArgs.hasModule('http')) {
            throw Error('missing http module');
        }

        const httpProvider = await configArgs.requireInstance('http');
        const httpClient = httpProvider.createClient(httpClientName);
        const apiClient = createApiPluginClient({ httpClient, path, selector });
        return new ApiPlugin(apiClient);
    };
};

export default createApiPlugin;

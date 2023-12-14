import type { ApiFeatureFlagPlugin, IApiPluginClient } from './types';

export class ApiPlugin implements ApiFeatureFlagPlugin {
    #apiClient: IApiPluginClient;

    constructor(apiClient: IApiPluginClient) {
        this.#apiClient = apiClient;
    }

    initial() {
        return this.#apiClient.getFeatureFlags();
    }
}

export default ApiPlugin;

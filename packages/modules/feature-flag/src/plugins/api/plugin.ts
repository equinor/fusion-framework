import type { ApiFeatureFlagPlugin, IApiPluginClient } from './types';

/**
 * Feature-flag plugin that fetches initial flags from a remote HTTP API.
 *
 * The plugin delegates to an {@link IApiPluginClient} to perform the
 * actual network request and returns the result as the initial flag set.
 */
export class ApiPlugin implements ApiFeatureFlagPlugin {
  #apiClient: IApiPluginClient;

  /** @param apiClient - The HTTP client used to fetch flags. */
  constructor(apiClient: IApiPluginClient) {
    this.#apiClient = apiClient;
  }

  /**
   * Returns the initial feature flags by fetching them from the API.
   *
   * @returns An observable input that emits the fetched flags.
   */
  initial() {
    return this.#apiClient.getFeatureFlags();
  }
}

export default ApiPlugin;

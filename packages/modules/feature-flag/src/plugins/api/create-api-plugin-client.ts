import type { IHttpClient } from '@equinor/fusion-framework-module-http';
import type { ApiResponseSelector, IApiPluginClient } from './types';

/**
 * Creates an {@link IApiPluginClient} that fetches feature flags using the
 * provided HTTP client.
 *
 * @param args - Client configuration.
 * @param args.httpClient - An `IHttpClient` instance.
 * @param args.path - Relative path for the feature-flags endpoint.
 * @param args.selector - Response selector that maps the HTTP response to flags.
 * @returns An {@link IApiPluginClient} instance.
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
  /** Relative HTTP client path. */
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

import type { ApiFeatureFlagPlugin, ApiResponseSelector } from './types';
import { type IFeatureFlag, FeatureFlag } from '../../FeatureFlag';
import type { FeatureFlagPluginConfigCallback } from '../../types';
import { createApiPluginClient } from './create-client';
import { ApiPlugin } from './plugin';

/**
 * Default selector that maps an HTTP JSON response to an array of
 * {@link FeatureFlag} instances.
 *
 * All flags returned by the API are marked as `readonly`.
 *
 * @param response - The HTTP response containing a JSON array of feature flags.
 * @returns Parsed array of {@link FeatureFlag} instances.
 */
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

/**
 * Creates a plugin that fetches feature flags from a remote HTTP endpoint.
 *
 * Requires the `http` module to be registered so that an HTTP client can be
 * created.
 *
 * @param args - Plugin configuration.
 * @param args.httpClientName - Name of the configured HTTP client to use.
 * @param args.path - Relative path appended to the HTTP client base URL.
 * @param args.selector - Optional custom response selector (defaults to JSON parsing).
 * @returns A {@link FeatureFlagPluginConfigCallback} ready for registration.
 *
 * @example
 * ```ts
 * builder.addPlugin(
 *   createApiPlugin({ httpClientName: 'my-api', path: '/feature-flags' })
 * );
 * ```
 */
export const createApiPlugin = (args: {
  httpClientName: string;
  /** Relative HTTP client path */
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

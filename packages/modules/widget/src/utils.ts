import type { GetWidgetParameters, IClient, WidgetEndpointBuilder } from './types';
import type { IHttpClient } from '@equinor/fusion-framework-module-http';

/**
 * Creates a {@link WidgetEndpointBuilder} that produces manifest endpoint URLs.
 *
 * Routes versioned or tagged lookups to `/widgets/{key}/versions/{value}` and
 * unversioned lookups to `/widgets/{key}`.
 *
 * @param apiVersion - API version string appended as a query parameter.
 * @returns A function that maps {@link GetWidgetParameters} to a URL path.
 */
export const defaultManifestEndpointBuilder =
  (apiVersion: string): WidgetEndpointBuilder =>
  (params: GetWidgetParameters) => {
    const { widgetKey, args } = params;
    const { type, value } = args ?? {};
    switch (type) {
      case 'tag':
      case 'version':
        return `/widgets/${widgetKey}/versions/${value}?api-version=${apiVersion}`;
      default:
        return `/widgets/${widgetKey}?api-version=${apiVersion}`;
    }
  };

/**
 * Creates a {@link WidgetEndpointBuilder} that produces config endpoint URLs.
 *
 * Routes versioned or tagged lookups to `/widgets/{key}/versions/{value}/config`
 * and unversioned lookups to `/widgets/{key}/config`.
 *
 * @param apiVersion - API version string appended as a query parameter.
 * @returns A function that maps {@link GetWidgetParameters} to a URL path.
 */
export const defaultConfigEndpointBuilder =
  (apiVersion: string): WidgetEndpointBuilder =>
  (params: GetWidgetParameters) => {
    const { widgetKey, args } = params;
    const { type, value } = args ?? {};
    // Todo Align endpoints with backend when its done!
    switch (type) {
      case 'tag':
      case 'version':
        return `/widgets/${widgetKey}/versions/${value}/config?api-version=${apiVersion}`;
      default:
        return `/widgets/${widgetKey}/config?api-version=${apiVersion}`;
    }
  };

/**
 * Creates the default {@link IClient} that uses the given HTTP client to
 * fetch widget manifests and configurations.
 *
 * Uses `api-version=1.0-preview` and the default manifest/config endpoint
 * builders.
 *
 * @param httpClient - An `IHttpClient` instance (typically resolved from the
 *   `apps` service-discovery key).
 * @returns A fully configured `IClient`.
 */
export const createDefaultClient = (httpClient: IHttpClient): IClient => {
  const apiVersion = '1.0-preview';
  return {
    apiVersion,
    baseImportUrl: httpClient.uri,
    getWidgetManifest: {
      client: {
        fn: (args) => httpClient.json$(defaultManifestEndpointBuilder(apiVersion)(args)),
      },
      key: (args) => JSON.stringify(args),
    },
    getWidgetConfig: {
      client: {
        fn: (args) => httpClient.json$(defaultConfigEndpointBuilder(apiVersion)(args)),
      },
      key: (args) => JSON.stringify(args),
    },
  };
};

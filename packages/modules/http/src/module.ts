/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientMsal } from './lib/client';
import {
  type IHttpClientConfigurator,
  HttpClientConfigurator,
  type HttpClientOptions,
} from './configurator';
import { type IHttpClientProvider, HttpClientProvider } from './provider';

import type {
  Module,
  ModuleConfigType,
  IModuleConfigurator,
} from '@equinor/fusion-framework-module';

import type { MsalModule } from '@equinor/fusion-framework-module-msal';

/**
 * Defines the type for the HTTP module, which includes:
 * - The module name: 'http'
 * - The type of the HTTP client provider, which is `IHttpClientProvider`
 * - The type of the HTTP client configurator, which is `IHttpClientConfigurator`
 */
export type HttpModule = Module<'http', IHttpClientProvider, IHttpClientConfigurator>;

/**
 * Defines the type for the HTTP module with MSAL authentication.
 *
 * This type represents the module configuration for the HTTP module, which includes:
 * - The module name: 'http'
 * - The type of the HTTP client provider, which is `IHttpClientProvider<HttpClientMsal>`
 * - The type of the HTTP client configurator, which is `IHttpClientConfigurator<HttpClientMsal>`
 * - The list of required modules, which includes the `MsalModule`
 */
export type HttpMsalModule = Module<
  'http',
  IHttpClientProvider<HttpClientMsal>,
  IHttpClientConfigurator<HttpClientMsal>,
  [MsalModule]
>;

/**
 * HTTP module with MSAL authentication.
 */
export const module: HttpMsalModule = {
  name: 'http',
  /**
   * Configures the HTTP module with MSAL authentication.
   *
   * This function creates a new `HttpClientConfigurator` instance using the `HttpClientMsal` class.
   * The `HttpClientConfigurator` is responsible for configuring the HTTP client with the necessary options,
   * such as the base URL, request headers, and other settings.
   *
   * @returns A new `HttpClientConfigurator` instance configured for MSAL authentication.
   */
  configure: () => new HttpClientConfigurator(HttpClientMsal),

  /**
   * Initializes the HTTP client provider with MSAL authentication.
   *
   * This function is responsible for setting up the default HTTP request handler
   * to acquire an access token from MSAL and attach it to the request headers
   * when the request includes scopes.
   *
   * @param config - The module configuration.
   * @param hasModule - A function to check if a module is available.
   * @param requireInstance - A function to get an instance of a module.
   * @returns A promise that resolves to the HTTP client provider.
   */
  initialize: async ({
    config,
    hasModule,
    requireInstance,
  }): Promise<HttpClientProvider<HttpClientMsal>> => {
    const httpProvider = new HttpClientProvider(config);
    if (hasModule('auth')) {
      const authProvider = await requireInstance('auth');
      httpProvider.defaultHttpRequestHandler.set('MSAL', async (request) => {
        const { scopes = [] } = request;
        if (scopes.length) {
          /** TODO should be try catch, check caller for handling */
          const token = await authProvider.acquireToken({
            scopes,
          });
          if (token) {
            const headers = new Headers(request.headers);
            headers.set('Authorization', `Bearer ${token.accessToken}`);
            return { ...request, headers };
          }
        }
      });
    }
    return httpProvider;
  },
};

/**
 * Configures the HTTP module with MSAL authentication.
 */
export const configureHttp = <TRef = unknown>(
  configure: (config: ModuleConfigType<HttpMsalModule>, ref?: TRef) => void,
): IModuleConfigurator<HttpMsalModule, TRef> => ({
  module,
  configure,
});

/**
 * Configures the HTTP client with MSAL authentication.
 *
 * This function creates a module configurator that can be used to configure the HTTP module
 * with MSAL authentication. The configurator takes a name and a set of HTTP client options,
 * and returns a module configurator that can be used to configure the HTTP module.
 *
 * @param name - The name of the HTTP client configuration.
 * @param args - The HTTP client options, including the MSAL configuration.
 * @returns A module configurator that can be used to configure the HTTP module.
 */
export const configureHttpClient = <TRef = unknown>(
  name: string,
  args: HttpClientOptions<HttpClientMsal>,
): IModuleConfigurator<HttpMsalModule, TRef> => ({
  module,
  configure: (config: ModuleConfigType<HttpMsalModule>) => {
    config.configureClient(name, args);
  },
});

/**
 * Declares a module named '@equinor/fusion-framework-module' that contains an interface named 'Modules' with a property 'http' of type 'HttpMsalModule'.
 */
declare module '@equinor/fusion-framework-module' {
  interface Modules {
    http: HttpMsalModule;
  }
}

export default module;

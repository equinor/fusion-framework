import { HttpClientConfigurator, HttpClientMsal, HttpClientProvider } from './http';

import { ServiceConfig, ServiceConfigurator, Services } from './types';

/**
 *  Configure http-client
 */
export const configurator: ServiceConfigurator = (config: Partial<ServiceConfig>) => {
    config.http = new HttpClientConfigurator(HttpClientMsal);
    return (services: Partial<Services>) => {
        if (!config.http) {
            throw Error('Missing config for HTTP');
        }
        /**
         * Add handler for setting token when request is executed
         */
        config.http.defaulHttpRequestHandler.add('msal', async (request) => {
            const { scopes = [] } = request;
            // TODO should be try catch, check caller for handling
            const token = await services.auth?.acquireToken({ scopes });
            if (token) {
                const headers = new Headers(request.headers);
                headers.append('Authorization', `Bearer ${token.accessToken}`);
                return { ...request, headers };
            }
        });
        return {
            http: new HttpClientProvider(config.http),
        };
    };
};

export default configurator;

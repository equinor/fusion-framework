import { HttpClientProvider, HttpClientMsal } from './http';

// TODO make provider
interface AuthClient {
    acquireToken(req: { scopes: string[] }): Promise<{ accessToken: string } | void>;
    login(): void;
}

export type Services = {
    auth: AuthClient;
    http: Pick<HttpClientProvider<HttpClientMsal>, 'createClient'>;
};

export type ServiceInitiator = (config: ServiceConfig) => void | Promise<void>;

interface ServiceConfig {
    auth: {
        client?: AuthClient;
    };
    http: HttpClientProvider<HttpClientMsal>;
}

type ServiceConfigurator<K extends keyof ServiceConfig, R = ServiceConfig[K]> = (
    services: Partial<Services>
) => R | Promise<R>;

const configureAuth: ServiceConfigurator<'auth'> = (services) => ({ client: services.auth });

const configureHttp: ServiceConfigurator<'http'> = (services) => {
    const http = new HttpClientProvider(HttpClientMsal);
    http.defaulHttpRequestHandler.add('msal', async (request) => {
        const { scopes } = request;
        if (scopes) {
            const token = await services.auth?.acquireToken({ scopes });
            if (token) {
                const headers = new Headers(request.headers);
                headers.append('Bearer', token.accessToken);
                return { ...request, headers };
            }
        }
    });
    return http;
};

const configureServices = async (services: Partial<Services>): Promise<ServiceConfig> => {
    const auth = await Promise.resolve(configureAuth(services));
    const http = await Promise.resolve(configureHttp(services));
    return { auth, http };
};

export const createServices = async (
    services: Partial<Services>
): Promise<(cb: ServiceInitiator) => Promise<Services>> => {
    const config = await configureServices(services);
    return async (init: (config: ServiceConfig) => void): Promise<Services> => {
        await Promise.resolve(init(config));
        const { auth, http } = config;

        if (!auth.client) {
            throw Error('No auth client provided!');
        }

        return {
            auth: {
                acquireToken: auth.client.acquireToken,
                login: auth.client.login,
            },
            http: {
                createClient: http.createClient,
            },
        };
    };
};

export default createServices;

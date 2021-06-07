import { HttpClientProvider, HttpClientConfigurator, HttpClientMsal } from './http';

// TODO make provider
interface AuthClient {
    acquireToken(req: { scopes: string[] }): Promise<{ accessToken: string } | void>;
    login(): void;
}

export type Services = {
    auth: AuthClient;
    http: HttpClientProvider<HttpClientMsal>;
};

export type ServiceInitiator = (config: ServiceConfig) => void | Promise<void>;

interface ServiceConfig {
    auth: {
        client?: AuthClient;
    };
    http: HttpClientConfigurator<HttpClientMsal>;
}

type ServiceConfigurator = (
    config: Partial<ServiceConfig>,
    services?: Services
) => (services: Partial<Services>) => Partial<Services> | Promise<Partial<Services>>;

const configureAuth: ServiceConfigurator = (
    config: Partial<ServiceConfig>,
    services?: Services
) => {
    config.auth = { client: services?.auth };
    return (_services: Partial<Services>) => {
        const client = config.auth?.client;
        if (!client) {
            throw Error('Missing auth Client');
        }
        return {
            auth: {
                client,
                acquireToken(args: { scopes: string[] }) {
                    return client.acquireToken(args);
                },
                login() {
                    client.login();
                },
            },
        };
    };
};

const configureHttp: ServiceConfigurator = (config: Partial<ServiceConfig>) => {
    config.http = new HttpClientConfigurator(HttpClientMsal);
    return (services: Partial<Services>) => {
        if (!config.http) {
            throw Error('Missing config for HTTP');
        }
        config.http.defaulHttpRequestHandler.add('msal', async (request) => {
            const { scopes = [] } = request;
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

export const createServices = async (
    services?: Services
): Promise<(cb: ServiceInitiator) => Promise<Services>> => {
    const config = {};
    const build = {
        auth: configureAuth(config, services),
        http: configureHttp(config, services),
    };
    return async (init: (config: ServiceConfig) => void): Promise<Services> => {
        await Promise.resolve(init(config as ServiceConfig));
        const services = await Object.keys(build).reduce(async (acc, key) => {
            const obj = await acc;
            const provider = await Promise.resolve(build[key as keyof typeof build](obj));
            return Object.assign(obj, provider);
        }, Promise.resolve({}));
        return services as Services;
    };
};

export default createServices;

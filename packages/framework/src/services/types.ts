import { HttpClientConfigurator, HttpClientMsal, HttpClientProvider } from './http';

// TODO
export interface AuthClient {
    acquireToken(req: { scopes: string[] }): Promise<{ accessToken: string } | void>;
    login(): void;
}

export interface AuthProvider {
    acquireToken(req: { scopes: string[] }): Promise<{ accessToken: string } | void>;
    acquireAccessToken(req: { scopes: string[] }): Promise<string | void>;
    login(): void;
}

export type Services = {
    auth: AuthProvider;
    http: HttpClientProvider<HttpClientMsal>;
};

export type ServiceInitiator = (config: ServiceConfig) => void | Promise<void>;

export interface ServiceConfig {
    auth: {
        client?: AuthClient;
        configureClient: (tennant: string, client: string, cb?: string) => void;
    };
    http: HttpClientConfigurator<HttpClientMsal>;
}

export type ServiceConfigurator = (
    config: Partial<ServiceConfig>,
    services?: Services
) => (services: Partial<Services>) => Partial<Services> | Promise<Partial<Services>>;

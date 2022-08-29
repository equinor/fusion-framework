import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Environment, EnvironmentResponse, Service } from './types';

export interface IServiceDiscoveryClient {
    readonly environment: Promise<Environment>;
    resolveService(key: string): Promise<Service>;
}

export interface IServiceDiscoveryClientCtor<TEnv extends Environment = Environment> {
    new (args: ServiceDiscoveryClientCtorArgs): ServiceDiscoveryClient<TEnv>;
}

type ServiceDiscoveryClientCtorArgs = {
    http: IHttpClient;
    endpoint: string;
};

export class ServiceDiscoveryClient<T extends Environment = Environment>
    implements IServiceDiscoveryClient
{
    protected _environment?: T;

    public endpoint: string;
    public http: IHttpClient;

    get environment(): Promise<Environment> {
        return { ...this._getEnvironment() };
    }

    constructor({ http, endpoint }: ServiceDiscoveryClientCtorArgs) {
        this.http = http;
        this.endpoint = endpoint;
    }

    public async selector(response: Response): Promise<T> {
        const env = (await response.json()) as EnvironmentResponse;
        const services = env.services.reduce((acc, service) => {
            return Object.assign(acc, {
                [service.key]: {
                    clientId: env.clientId,
                    uri: service.uri,
                    defaultScopes: [env.clientId + '/.default'],
                },
            });
        }, {} as T);
        return { ...env, services } as unknown as T;
    }

    public async resolveService(key: string): Promise<Service> {
        const { services } = await this._getEnvironment();
        // TODO - not found error
        const service = services[key];
        return service;
    }

    protected async _getEnvironment(): Promise<T> {
        if (!this._environment) {
            this._environment = await this._fetchServiceDescription();
        }
        return this._environment;
    }

    protected async _fetchServiceDescription(): Promise<T> {
        try {
            const { http, selector, endpoint } = this;
            const result = await http.fetch(endpoint, { selector });
            return result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

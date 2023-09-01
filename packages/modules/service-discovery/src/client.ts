import { IHttpClient } from '@equinor/fusion-framework-module-http';
import { Query } from '@equinor/fusion-query';

import { Environment, EnvironmentResponse, Service } from './types';

import { firstValueFrom } from 'rxjs';

export interface IServiceDiscoveryClient {
    readonly environment: Environment;
    resolveService(key: string): Promise<Service>;
    fetchEnvironment(): Promise<Environment>;
}

export interface IServiceDiscoveryClientCtor<TEnv extends Environment = Environment> {
    new (args: ServiceDiscoveryClientCtorArgs): ServiceDiscoveryClient<TEnv>;
}

type ServiceDiscoveryClientCtorArgs = {
    http: IHttpClient;
    endpoint: string;
};

const queryKey = 'services';

export class ServiceDiscoveryClient<T extends Environment = Environment>
    implements IServiceDiscoveryClient
{
    // TODO - make better
    #query: Query<T, void>;

    public endpoint: string;
    public http: IHttpClient;

    get environment(): T {
        const env = this.#query.cache.getItem(queryKey)?.value;
        if (!env) {
            throw Error('no cached environment found');
        }
        return env;
    }

    constructor({ http, endpoint }: ServiceDiscoveryClientCtorArgs) {
        this.http = http;
        this.endpoint = endpoint;
        this.#query = new Query<T, void>({
            client: {
                fn: () => http.fetch$(endpoint, { selector: this.selector.bind(this) }),
            },
            key: () => queryKey,
            expire: 5 * 60 * 1000,
            // queueOperator: (_) => ($) => $.pipe(throttleTime(100)),
        });
    }

    public async fetchEnvironment(): Promise<T> {
        return firstValueFrom(
            Query.extractQueryValue(
                this.#query.query(undefined, { cache: { suppressInvalid: true } }),
            ),
        );
    }

    public async selector(response: Response): Promise<T> {
        const env = (await response.json()) as EnvironmentResponse;
        const services = env.services.reduce((acc, service) => {
            return Object.assign(acc, {
                [service.key]: {
                    clientId: env.clientId,
                    uri: service.uri,
                    defaultScopes: service.defaultScopes ?? [env.clientId + '/.default'],
                },
            });
        }, {} as T);
        return { ...env, services } as unknown as T;
    }

    public async resolveService(key: string): Promise<Service> {
        try {
            const { services } = await this.fetchEnvironment();
            const service = services[key];
            return service;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

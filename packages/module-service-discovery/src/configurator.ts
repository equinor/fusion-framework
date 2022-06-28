import type { Environment, EnvironmentResponse } from './types';

export interface IServiceDiscoveryConfigurator {
    /** name of HttpClient */
    clientKey: string;
    /** URI for discovery */
    uri: string;
    /** Response selector */
    selector: (response: Response) => Promise<Environment>;
}

const defaultSelector = async (response: Response): Promise<Environment> => {
    const env = (await response.json()) as EnvironmentResponse;
    const services = env.services.reduce((acc, service) => {
        return Object.assign(acc, {
            [service.key]: {
                clientId: env.clientId,
                uri: service.uri,
                defaultScopes: [env.clientId + '/.default'],
            },
        });
    }, {});
    return { ...env, services };
};

export class ServiceDiscoveryConfigurator implements IServiceDiscoveryConfigurator {
    clientKey = 'service_discovery';
    uri = '/_discovery/environments/current';
    selector = defaultSelector;
}

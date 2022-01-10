export type ServiceDiscoveryConfig = {
    /** name of HttpClient */
    clientKey: string;
    /** URI for discovery */
    uri: string;
};

const DEFAULT_OPTIONS: ServiceDiscoveryConfig = {
    clientKey: 'service_discovery',
    uri: '/_discovery/environments/current',
};

export interface IServiceDiscoveryConfigurator {
    /** key of http client */
    clientKey: string;

    /** path of service discovery */
    uri: string;
}

export class ServiceDiscoveryConfigurator implements IServiceDiscoveryConfigurator {
    clientKey: string;
    uri: string;

    /** */
    constructor(config: Partial<ServiceDiscoveryConfig> = DEFAULT_OPTIONS) {
        /** apply default config */
        const { clientKey, uri } = Object.assign(
            {},
            DEFAULT_OPTIONS,
            config
        ) as ServiceDiscoveryConfig;
        this.clientKey = clientKey;
        this.uri = uri;
    }
}

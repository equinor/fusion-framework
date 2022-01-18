export interface IServiceDiscoveryConfigurator {
    /** name of HttpClient */
    clientKey: string;
    /** URI for discovery */
    uri: string;
    baseUrl: string;
}

export class ServiceDiscoveryConfigurator implements IServiceDiscoveryConfigurator {
    clientKey = 'service_discovery';
    uri = '/_discovery/environments/current';
    baseUrl = '';
}

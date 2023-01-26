# Fusion Service Provider

## Configure

```ts

/** configure the client which should fetch service descriptions */ 
config.http.configureClient('my_service_discovery', {
  baseUri: 'https://foo.bar',
  defaultScopes: ['321312bab2-3213123bb-321312aa2/.default'],
});

/** key of configured http client, default `service_discovery` */
config.serviceDiscovery.clientKey = 'my_service_discovery'

/** endpoint for fetching services */
config.serviceDiscovery.uri = 'api/services';

/** parse http response to service discovery environment */
config.serviceDiscovery.selector = async (response: Response): Promise<Environment> => {
  const services = await response.json() as Service[];
  return services.reduce((acc, service) => Object.assign(acc, {[service.key]: service}), {});
}
```
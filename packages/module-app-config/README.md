# Module App Config

_📦 Module for providing application with config as an service_

## Dependencies

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule%2Fpackage.json&label=@equinor/fusion-framework-module&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module)

### Optional

> - __http__ is not required if `IHttpClient` is provided
> - __service-discovery__ is not required if `IHttpClient` is configure with key `appConfig` in http module

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule-http%2Fpackage.json&label=@equinor/fusion-framework-module-http&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-http)


[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule-service-discovery%2Fpackage.json&label=@equinor/fusion-framework-module-service-discovery&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-service-discovery)


## Basic

This module should be implemented by the framework and provided by the application framework.

## Lifecycle

### Configure

__case 1: No reference modules are provided (Framework)__

The `IAppConfigConfigurator` will not have any default `IHttpClient`

__case 2: `HttpModule` and `ServiceDiscoveryModule` are provided (App)__

Before the configurator is created, the module will check ref modules if http has configured a client,
then if not, try to resolve client from service discovery. The client will be assigned to the `IAppConfigConfigurator`

### Initialize

__case 1: No `IHttpClient` is provided (Framework)__

1. The module will await init of `HttpModule`
2. The module will try to create a `IHttpClient`
3. If no client was created in step 2, it will await init of `ServiceDiscoveryModule` for client
4. The module will create an `IAppConfigProvider` which is provided to `IAppConfigProvider`;

__case 2: `IHttpClient` is provided (App)__

The module will create an `IAppConfigProvider` which is provided to `IAppConfigProvider`;

## Advance Config

> 🤙🏻 when working within the Fusion eco system none of these configs should be necessary.

### Configure your own http client
```ts
import { appConfigModuleKey } from '@equinor/fusion-framework-module-app-config'
modules.http.configureClient(
  appConfigModuleKey,
  {
    baseUri: 'https://foo.bar',
    defaultScopes: ['foobar/.default'],
  },
  (client) => {
    client.requestHandler.setHeader('x-api-version', '1.0.0-beta.2');
    client.requestHandler.add('logger', console.log);
    client.responseHandler.add('logger', console.log);
  } 
);
```

### Configure endpoint generation
```ts
config.appConfig.generateUrl = (appKey: string, tag?: string) => {
  return `/api/apps/${appKey}/config${tag ? `?tag=${tag}` : ''}`;
}
```

### Configure response selector
```ts
config.appConfig.selector = async(result: Response): Promise<AppConfig<TEnvironment>> => {
  const data = await result.json();
  /** custom logic for extracting and normalizing data to valid app config */
  return normalizeAppConfigResponseData(data);
}
```

### Defining your custom http client
> ☢️  __Boss__ mode only, really understand framework before even attempt
```ts
class MyCustomClient implements IHttpClient {}
config.appConfig.httpClient = new MyCustomClient
```
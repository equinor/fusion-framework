---
title: Module Services
category: Module
tag:
  - services
  - http
  - api
---

<ModuleBadge module="module-services" />

## Configuration

by default this module does not require any configuration if the Service discovery module is configured for the portal or the application.

::: code-tabs
@tab:active Basic
```ts
import { enableServices } from '@equinor/fusion-framework-module-services';
export default (configurator: IAppConfigurator) => {
  enableServices(configurator);
}
```
@tab Custom
```ts
import { configureServices } from '@equinor/fusion-framework-module-services';
export default (configurator: IAppConfigurator) => {
  configurator.addConfig(
    configureServices(config => {
      config.createClient(...);
    })
  )
}
```
:::

### HttpClient

::: warning createClient 
Only works if not `createClient` on the config object is overridden 
:::

By default the module will first try to load a named client from the [HttpProvider](../http#configure).

If no client is defined, the [Service Discovery Module](../service-discovery) will try to resolve the service.

## Usage

### Create api client
```ts
type createApiClient<TService extends Service, TMethod extends keyof ClientMethod> = (
  /** name of the service to create client for */
  name: TService,
  /** execution method, defaults to `json` */
  method: TMethod

): Promise<ApiServices<IHttpClient, TMethod>[TService]>

type ClientMethod<T = unknown> = {
    fetch: Promise<FetchResponse<T>>;
    json: Promise<T>;
    fetch$: StreamResponse<FetchResponse<T>>;
    json$: StreamResponse<T>;
};
```

::: code-tabs#flow

@tab:active Async
```ts
const apiClient = await serviceProvider.createApiClient(Service.Context, 'json');
const apiClient = await serviceProvider.createApiClient(Service.Context, 'fetch');
```

@tab Observable
```ts
const apiClient = await serviceProvider.createApiClient(Service.Context, 'json$');
const apiClient = await serviceProvider.createApiClient(Service.Context, 'fetch$');
```
:::

::: warning Fetch
when using the fetch method on api client, you need to parse the response and set request headers for json
:::

### Execute api request

```ts
type ApiMethod<
  TVersion extends string = keyof typeof ApiVersion,
  /** defaults to type map provided version */
  TResult = ApiFunctionResponse<TVersion>
>(
    version: TVersion,
    /** parameters for call function */
    ...args: Parameters<ApiFunction<TVersion, TMethod, TClient, TResult>>
): ApiFunctionResult<TVersion, TMethod, TResult>

/** 
 * @see context/get-context/client
 * @note data type if only for illustrting what the api client resolves the return type to be
 */
const data_v1: ApiContextEntity_v1 = await apiClient.x.get('v1', { id: 'eee' });
const data_v2: ApiContextEntity_v2 = await apiClient.x.get('v2', { id: 'eee' });

/** 
 * custom selector
 * @note the api method will resolve the return type from the selector
 */
const data_v2: MyApiContextEntity_v3_beta = await apiClient.x.get(
  'v2_beta', 
  { id: 'eee' }, 
  selector: (x: FetchResponse<ApiContextEntity_v2>) => new MyApiContextEntity_v3_beta(x)
); 
```

## Advance

### client

For service endpoints exposed, there is a client method for executing the request

```ts
/** 
 * create a reusable function for api calls
 * 
 * @template TVersion - version of the endpoint
 * @template TMethod - call method of the http client, defaults to json
 * @template TClient - IHttpClient which will execute the request
 */
type Query = 
  <
    TVersion extends string = keyof typeof ApiVersion,
    TMethod extends keyof ClientMethod = keyof ClientMethod,
    TClient extends IHttpClient = IHttpClient
  >(
    client: TClient,
    version: TVersion,
    method: TMethod = 'json' as TMethod
  ) =>
    /** 
     * @template T - return type from execution to the endpoint
     */
    <T = QueryContextResponse<TVersion>>(
      args: QueryArgs<TVersion>,
      init?: ClientRequestInit<TClient, T>
    ): QueryResult<TVersion, TMethod, T>
```

#### example
```ts
import { getContext } from '@equinor/fusion-framework-module/service/context/get';
const fn = await getContext(client, 'v1');
const result = fn({ id:'123' });
```

### generate parameters

Method for generating endpoint and arguments for service.

```ts
import { generateParameters } from '@equinor/fusion-framework-module/service/context/get';

/** IHttpClient */
const response = client.fetch(...generateParameters('v1', {id: '123'}));
```

### generate endpoint

Method for generating endpoint for service

```ts
import { generateEndpoint } from '@equinor/fusion-framework-module/service/context/get';

const endpoint = generateEndpoint('v1', {id: '123'});
const response = await fetch(endpoint);
```


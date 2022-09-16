---
title: Module http

category: Module
tag:
  - http
  - core
---

<ModuleBadge module="module-http" />

|Namespace|description|
|---------|-----------|
|__@equinor/fusion-framework-module-http__|__module interface__|
|@equinor/fusion-framework-module-http/client|http client|
|@equinor/fusion-framework-module-http/selectors|request selectors|
|@equinor/fusion-framework-module-http/operators|request and response operators|


## Configure

This module allows configuration of http client which would be used in runtime.

Each configuration of clients are mapped to key and initiated when runtime requests a client.

::: tip pre configuring
Clients can be provided on the fly, but as good practice, all clients should be defined in `config.ts`
:::

::: code-tabs
@tab:active Simple
```ts
import { configureHttpClient } from '@equinor/fusion-framework-module-http';

config.addConfig(configureHttpClient(
  'my-client',
  /** HttpClientOptions */
  {
    baseUri: 'https://foo.bar/api';
    defaultScopes: ['my-scope/.default']
  }
));
```

@tab Advance
```ts
import { 
  configureHttpClient, 
  configureHttp 
} from '@equinor/fusion-framework-module-http';

config.addConfig(configureHttp(
  'my-client',
  (config: IHttpClientConfigurator) => {
    /** cannot execute authorized requests */
    config.http.configureClient(
      'bar',
      'https://somewhere-test.com'
    );

    config.configureClient(
      'bar', 
      {
        baseUri: 'https://foo.bar',
        defaultScopes: ['foobar/.default']
      }
    );

    config.configureClient(
      'bar',
      /** callback with created http client  */
      (client: IHttpClient): => {
        client.uri = 'https://foo.bar'
        client.defaultScopes: ['foobar/.default']

        /** custom header */
        client.requestHandler.setHeader('x-foo', 'foo-bar');
        
        /** custom process handler of requests  */
        client.requestHandler.add('foo', (request: FetchRequest) => {
          console.log(request);
        });

        /** custom process handler of requests  */
        client.responseHandler.add('foo', (response: Response) => {
          console.log(response.ok);
        });
      }
    );
  }
));
```
:::


### HttpClientOptions

#### baseUri? `string` 
base endpoint for client
#### defaultScopes? `Array<string>`
array of [OAuth scope](https://oauth.net/2/scope/) for acquiring token

#### ctor? `HttpClientConstructor<IHttpClient>` <Badge color="orange" text="caution" />
Bring your own implementation of `IHttpClient`

#### onCreate? `(client: TClient) => void;` <Badge color="cornflowerblue" text="advance" />
Manipulate `IHttpClient` instance before usage in runtime

#### requestHandler? ` HttpRequestHandler<HttpClientRequestInitType<IHttpClient>>` <Badge color="orange" text="caution" />
Provide a custom `HttpRequestHandler`.
> instead of replacing the handler, add handler `onCreate` or configure client with a callback 

#### responseHandler? ` HttpResponseHandler<HttpClientRequestInitType<IHttpClient>>` <Badge color="orange" text="caution" />
Provide a custom `HttpResponseHandler`.
> instead of replacing the handler, add handler `onCreate` or configure client with a callback 

## Usage

### Creating a client
```ts
const client = modules.http.createClient('foo');
```


### Fetch

::: code-tabs#flow
@tab:active Async
```ts
client.fetch('/api', {selector}).then(console.log);
```

@tab Stream
```ts
client.fetch$('/api', {selector}).subscribe(x => console.log(x));
```
:::

The fetch request arguments are the same as [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Request), but has additional `scope` and `selector` property.

#### Scopes <Badge type="info" text="optional"/>

An application can request one or more scopes, this information is then presented to the user in the consent screen, and the access token issued to the request will be limited to the scopes granted.

> Scopes are normally configured for the client, so that by convinces all request done to that base URI will have that scope. But sometimes a endpoint on that URI requires other scopes.

#### Selector <Badge type="info" text="optional"/>

Selectors are callback for processing the response. 

When a selector is provided, the return type of `client.fetch` will be the same as return type of the selector.

::: tip
Selectors should be used, since they map Domain Transfer Object (DTO) to Value Objects (VO)

Secondly by abstracting the response selector, the selector can be tested without actually executing a request
:::

```ts
const selector = (response: Response): Promise<FooBar> => response.json(); 
```

### Json

::: code-tabs#flow
@tab:active Async
```ts
client.json('/api', {selector}).then(console.log);
```

@tab Stream
```ts
client.json$('/api', {selector}).subscribe(x => console.log(x));
```
:::

Convinces method for json calls, internally calls [fetch](#fetch), but adds `Content-Type=application/json` to the request header. Also add a default selector if none provided `data = await response.json()`
### Abort

calling `client.abort()` will cancel all ongoing request that the client has.

> when executing an async call, an [abort signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) should be provided with the request arguments

::: code-tabs#flow
@tab:active Async
```ts
const controller = new AbortController();
const {abort, signal} = controller;
setTimeout(abort, 10);
client.fetch('foo', {signal});
```

@tab Stream
```ts
/** unsubscribing to an request will abort the request */
const subscription = client.fetch$('foo').subscribe(console.log);
setTimeout(subscription.unsubscribe , 10);
```
:::


## Operators 

Operators are handlers that are executed recursively when executing an request and on response (middleware).

::: warning persistent
When an operator is set/added to an `IHttpClient`, the operator will persist on that client until disposed.
:::

```ts
import type { ProcessOperator } from '@equinor/fusion-framework-module-http/operators';
const logOperator = (logger: (...args: string[])): ProcessOperator => (x => logger(x));

/** note that a convinces method for adding headers are included */
client.requestHandler.setHeader('x-trace-id', 'my_foot_print')

/** add a predefined operator */
client.requestHandler.add('log', logOperator(console.log));
client.responseHandler.add('log', logOperator(console.debug));

/** inline operator */
client.requestHandler.add('no-cache', (req) => Object.assign(req, {cache: 'no-cache'});

```

## Subscriptions

`IHttpClient` exposes observable requests and responses, an observer can never modify the data, which means these properties are meant for things like telemetry. 

::: code-tabs
@tab Request
```ts
client.request$.subscribe(
  {
    next: (x: Request) => console.debug(x),
    error: (x: any) => console.error(x),
    complete: () => console.log(`client closed`)
  }
)
```
@tab Response
```ts
client.response$.subscribe(
  {
    next: (x: Response) => console.debug(x),
    error: (x: any) => console.error(x),
    complete: () => console.log(`client closed`)
  }
)
```
:::

## React

<ModuleBadge module="react-module-http" />

::: code-tabs#scope
@tab Vanilla
```ts
import { useHttpClient } from '@equinor/fusion-framework-react-module-http';
const myClient = useHttpClient('my-client');
```

@tab:active App
```ts
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
const myClient = useHttpClient('my-client');
```

@tab Portal
```ts
import { useHttpClient } from '@equinor/fusion-framework-react/http';
const myClient = useHttpClient('my-client');
```
:::


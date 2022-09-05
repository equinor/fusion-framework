---
title: HTTP
category: Module
tags:
  - http
  - core
---

<ModuleBadge module="module-http" />


## Configure

This module allows configuration of http client which would be used in runtime.

Each configuration of clients are mapped to key and initiated when runtime requests a client.

::: tip pre configuring
Clients can be provided on the fly, but as good practice, all clients should be defined in `config.ts`
:::

```ts
type confgure = ModulesConfigurator<[HttpMoldule]>;
type config = ModuleConfigType<[HttpMoldule]>;
```

:::: code-group
::: code-group-item Simple
```ts
/** cannot execute authorized requests */
const configure = (config) => {
  config.http.configureClient(
      'bar',
      'https://somewhere-test.com'
    );
}
```
:::

::: code-group-item Standard:active
```ts
const configure = (config) => {
  config.http.configureClient(
      'bar', 
      {
        baseUri: 'https://foo.bar',
        defaultScopes: ['foobar/.default']
      }
    );
}
```
:::

::: code-group-item Advance
```ts
const configure = async(config) => {
  config.http.configureClient(
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
```
:::

::::

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

:::: code-group
::: code-group-item Async:active
```ts
client.fetch('/api', {selector}).then(console.log);
```
:::

::: code-group-item Stream
```ts
client.fetch$('/api', {selector}).subscribe(x => console.log(x));
```
:::
::::

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

:::: code-group
::: code-group-item Async:active
```ts
client.json('/api', {selector}).then(console.log);
```
:::

::: code-group-item Stream
```ts
client.json$('/api', {selector}).subscribe(x => console.log(x));
```
:::
::::

Convinces method for json calls, internally calls [fetch](#fetch), but adds `Content-Type=application/json` to the request header. Also add a default selector if none provided `data = await response.json()`
### Abort

calling `client.abort()` will cancel all ongoing request that the client has.

> when executing an async call, an [abort signal](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) should be provided with the request arguments

:::: code-group
::: code-group-item Async:active
```ts
const controller = new AbortController();
const {abort, signal} = controller;
setTimeout(abort, 10);
client.fetch('foo', {signal});
```
:::

::: code-group-item Stream
```ts
/** unsubscribing to an request will abort the request */
const subscription = client.fetch('foo').subscribe(console.log);
setTimeout(subscription.unsubscribe , 10);
```
:::
::::


## Operators
Operators are handlers that are executed recursively when executing an request and on response (middleware)

:::: code-group
::: code-group-item Request
```ts
client.requestHandler.add((x: Request) => console.debug(x));
```
:::

::: code-group-item Response
```ts
client.responseHandler.add((x: Response) => console.debug(x));
```
:::
::::

## Subscriptions

`IHttpClient` exposes observable requests and responses, an observer can never modify the data, which means these properties are meant for things like telemetry. 

:::: code-group
::: code-group-item Request
```ts
client.request$.subscribe(
  {
    next: (x: Request) => console.debug(x),
    error: (x: any) => console.error(x),
    complete: () => console.log(`client closed`)
  }
)
```
:::

::: code-group-item Response
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
::::

## React

<ModuleBadge module="react-module-http" />

:::: code-group
::: code-group-item Vanilla
```ts
import { useHttpClient } from '@equinor/fusion-framework-react-module-http';
```
:::

::: code-group-item App:active
```ts
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
```
:::

::: code-group-item Portal
```ts
import { useHttpClient } from '@equinor/fusion-framework-react/http';
```
:::
::::

```ts
const useRequest = () => {
  const myClient = useHttpClient('my-client');
  ...
}
```

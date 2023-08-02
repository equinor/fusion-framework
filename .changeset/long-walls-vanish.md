---
'@equinor/fusion-framework-app': minor
---

Allow options for `config.useFrameworkServiceClient`

Add optional configuration when using a predefined client from service discovery

**Changed interface**
```ts
type useFrameworkServiceClient = (
  service_name: string,
  /** new, allows customize registration of http client from service discovery */
  options?: Omit<HttpClientOptions<any>, 'baseUri' | 'defaultScopes'>,
)
```

__example__
```ts
config.useFrameworkServiceClient('some_fusion_service', {
  onCreate(client: IHttpClient) {
      /** make creation of http client add default request header */
      client.requestHandler.setHeader('api-version', '2.0');
  },
});
```
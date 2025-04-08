# Fusion Framework Dev Server

This package provides a development server for Fusion Framework applications.

## Configuration

This dev server is focused on Fusion Framework, but under the hood it uses Vite. The configuration is a mix of Vite and Fusion Framework.
The dev server is created using the `createDevServer` function, which takes a configuration object as an argument.

The first argument is the generic fusion framework configuration, which simplifies the configuration for the dev server.

The second argument is the Vite configuration object, which is optional and overrides the default Vite configuration.
see [Vite options](https://vite.dev/config/) for more details.

> [!TIP]
const devServer = await createDevServer({
> You can use the `createDevServerConfig` to generate fusion configuration, then `Vite.mergeConfig` to merge with additional Vite configuration. Then create the dev server with `Vite.createServer`. The `createDevServer` function is a wrapper around this.

### Basic Configuration

The dev server requires a basic configuration object to be passed to it.

```ts
const devServer = await createDevServer({
  spa: {
    templateEnv: {
      portalId: 'dev-portal',
      title: 'My Test Dev Server',
      serviceDiscovery: {
        url: 'https://location.of.your.service.discovery',
        scopes: ['scope_required'],
      },
      msal: {
        clientId: 'dev-client-id',
        tenantId: 'dev-tenant-id',
        redirectUri: '/authentication/login-callback',
        requiresAuth: 'true',
      },
    },
  },
});
```

### Adding Service Discovery

By adding configuration to the `api` object, you can add service discovery to your dev server. This is useful for mocking API requests and setting up routes. see [@equinor/fusion-framework-vite-plugin-api-service](../vite-plugins/api-service/README.md) for more details.

```ts
createDevServer(
  {
    // Adding proxying for service discovery
    api: {
      // proxy target for service discovery
      serviceDiscoveryUrl: 'https://location.of.your/service/discovery',
      // method for modifying the service discovery response and setting up routes
      processServices: (dataResponse, route) => {
        const { data, routes } = processServices(dataResponse, route);
        return {
          data: data.concat({
            key: 'portals',
            name: 'Portal Service - MOCK',
            uri: '/@fusion-api/portals',
          }),
          routes,
        };
      },
    },
    routes: [ /** add proxy and middleware routes */]
  }
);
```


## Proxying API Requests

Sometimes proxy requests need authentication tokens, or need to be rewritten to a different path. The dev server can handle this by using the `serviceWorker` configuration.

see [Vite server Proxy](https://vite.dev/config/server-options#server-proxy) for more details for setting up the proxy.

```ts
createDevServer(
  {
    ... // add basic configuration here

    // intercepting requests to /api and rewriting them to /api-v1 and adding auth token
    serviceWorker: {
      resources: [
        {
          url: '/api',
          rewrite: '/api-v1',
          scopes: ['scope1', 'scope2'],
        },
      ],
    }
  }, 
  {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  }
);
```
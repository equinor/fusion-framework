# Fusion Vite Api Plugin

This package provides a Vite plugin for Fusion Framework applications that allows generate proxy routes for service discovery. It is used in the Fusion Framework Dev Server to mock API requests and set up routes.

## Configuration

```ts
import fusionApiPlugin, { createProxyHandler } from '@equinor/fusion-framework-vite-plugin-api-service';

fusionApiPlugin({
  proxyHandler: createProxyHandler({
    // proxy target for service discovery
    serviceDiscoveryUrl: 'https://location.of.your/service/discovery',
    // method for modifying the service discovery response and setting up routes
    processServices: (dataResponse, args) => {
      const { route, request } = args;
      const apiRoutes = [] as ApiRoute[];
      const apiServices = [];

      for (const service of data) {
        apiServices.push({ ...service, uri: /** local proxy url */ });
        apiRoutes.push({
          match: /** proxy route to match */,
          proxy: {
            target: /** proxy target */,
            rewrite: /** rewrite path */,
          },
        });
      }

      // add non-existing service to the list
      apiServices.push(/** non-existing service */);
      apiRoutes.push(/** non-existing service proxy route */);
    },
  }),
});
```

### Mock API Requests

```ts

fusionApiPlugin({
  routes: [
    {
      match: '/service-name/path-to/mock',
      middleware: (req, res) => {
        // handle request and response
        res.json({ data: 'mocked data' });
      },
    },
  ],
});
```



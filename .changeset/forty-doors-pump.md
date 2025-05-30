---
"@equinor/fusion-framework-dev-server": major
---

Introduced a new package, `@equinor/fusion-framework-dev-server`, designed to provide a development server tailored for Fusion Framework applications. Built on top of Vite, it seamlessly integrates Vite and Fusion Framework configurations.

**Features**

- *`createDevServer` Function*: Simplifies the creation of a development server using a configuration object.
- *`createDevServerConfig` Function*: Generates a Vite-compatible configuration for the development server.
- *SPA Support*: Includes `spa.templateEnv` for defining environment variables specific to Single Page Applications.
- *API Service Discovery*: Enables proxying and route mapping for API services via `api.serviceDiscoveryUrl`.
- *Dynamic Proxy Routes*: Introduced the `processServices` function to remap Fusion services' URIs and dynamically generate proxy routes.
- *Logging*: Integrated `@equinor/fusion-log` for customizable logging, with dedicated sub-loggers for SPA and API services.

**Dependencies**

The following dependencies were added to support the new package:
- `@equinor/fusion-framework-vite-plugin-api-service`
- `@equinor/fusion-framework-vite-plugin-spa`
- `@equinor/fusion-log`

**Examples**

*Using `createDevServer`*

```ts
import { createDevServer } from "@equinor/fusion-framework-dev-server";

const devServer = await createDevServer({
  spa: {
    templateEnv: {
      portal: {
        id: "dev-portal",
      },
      title: "My Test Dev Server",
    },
  },
  api: {
    serviceDiscoveryUrl: "https://location.of.your.service.discovery",
    processServices: (data, route) => {
      return {
        data: data.concat({
          key: "mock-service",
          name: "Mock Service",
          uri: "/mock-api",
        }),
        routes: [],
      };
    },
  },
});
```

*Using `createDevServerConfig`*

```ts
import { createDevServerConfig } from "@equinor/fusion-framework-dev-server";

const config = createDevServerConfig({
  spa: {
    templateEnv: { API_URL: "https://api.example.com" },
  },
  api: {
    serviceDiscoveryUrl: "https://discovery.example.com",
    routes: ["/api"],
  },
});
```

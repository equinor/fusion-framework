# @equinor/fusion-framework-dev-server

## 1.0.0-next.1

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`84c16d7`](https://github.com/equinor/fusion-framework/commit/84c16d74c3235f809ce4c3e75868be12010ed695) Thanks [@odinr](https://github.com/odinr)! - Add `prepack` script to `dev-portal` and `dev-server` packages

  - Added a `prepack` script to `@equinor/fusion-framework-dev-portal` and `@equinor/fusion-framework-dev-server` to ensure the build runs before packaging.
  - This helps guarantee that the latest build artifacts are included when publishing these packages.

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - Introduced a new package, `@equinor/fusion-framework-dev-server`, designed to provide a development server tailored for Fusion Framework applications. Built on top of Vite, it seamlessly integrates Vite and Fusion Framework configurations.

  **Features**

  - _`createDevServer` Function_: Simplifies the creation of a development server using a configuration object.
  - _`createDevServerConfig` Function_: Generates a Vite-compatible configuration for the development server.
  - _SPA Support_: Includes `spa.templateEnv` for defining environment variables specific to Single Page Applications.
  - _API Service Discovery_: Enables proxying and route mapping for API services via `api.serviceDiscoveryUrl`.
  - _Dynamic Proxy Routes_: Introduced the `processServices` function to remap Fusion services' URIs and dynamically generate proxy routes.
  - _Logging_: Integrated `@equinor/fusion-log` for customizable logging, with dedicated sub-loggers for SPA and API services.

  **Dependencies**

  The following dependencies were added to support the new package:

  - `@equinor/fusion-framework-vite-plugin-api-service`
  - `@equinor/fusion-framework-vite-plugin-spa`
  - `@equinor/fusion-log`

  **Examples**

  _Using `createDevServer`_

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

  _Using `createDevServerConfig`_

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

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - exported UserConfig interface from vite

- Updated dependencies [[`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.0
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.0

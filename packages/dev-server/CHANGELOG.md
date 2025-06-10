# @equinor/fusion-framework-dev-server

## 1.0.0-next.6

### Patch Changes

- Updated dependencies [[`ea96493`](https://github.com/equinor/fusion-framework/commit/ea96493d95336f682e31a7b63161783ae7c99a63)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.5

## 1.0.0-next.5

### Patch Changes

- Updated dependencies [[`8870e73`](https://github.com/equinor/fusion-framework/commit/8870e73bd6d4141142c69c11c67b5b154bc80023)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.4

## 1.0.0-next.4

### Patch Changes

- Updated dependencies []:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.3

## 1.0.0-next.3

### Patch Changes

- [#3075](https://github.com/equinor/fusion-framework/pull/3075) [`2ed792a`](https://github.com/equinor/fusion-framework/commit/2ed792a1118f3726f811c4dbdf8d25c69d7bb756) Thanks [@odinr](https://github.com/odinr)! - removed options for server options for `createDevServerConfig`, use overrides instead on `createDevServer`

- Updated dependencies [[`ca8d6c8`](https://github.com/equinor/fusion-framework/commit/ca8d6c834f9df35041ce8c7e2563c452d8b19276), [`7878f59`](https://github.com/equinor/fusion-framework/commit/7878f591c528d463bfbe558094c2c31004db8586)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.2

## 1.0.0-next.2

### Patch Changes

- Updated dependencies [[`96ad5d3`](https://github.com/equinor/fusion-framework/commit/96ad5d3a3aafe7adf5bd7f8e48e58bb19aa95ba8)]:
  - @equinor/fusion-framework-vite-plugin-spa@1.0.0-next.1
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.1

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

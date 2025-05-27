# @equinor/fusion-framework-vite-plugin-api-service

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - Added a new Vite plugin, `API Service Vite Plugin`, designed for development purposes to proxy or mock `Service Discovery` APIs.

  ### Features:

  - **Proxy or Mock APIs:** Simplifies handling and intercepting API calls during development.
  - **Custom Route Handling:** Supports middleware or proxy-based route management.
  - **Advanced Proxy Capabilities:** Includes response processing and dynamic route generation.
  - **Utility Functions:** Provides helper functions like `createResponseInterceptor` and `createRouteMatcher` for response manipulation and route matching.

  ### Usage:

  - Integrate the plugin into your Vite project by adding it to `vite.config.ts`.
  - Configure with `proxyHandler` for advanced proxying and `routes` for custom route definitions.

  ```ts
  import { defineConfig } from "vite";
  import { plugin as apiServicePlugin } from "@equinor/fusion-dev-server/api-service-plugin";

  export default defineConfig({
    plugins: [
      apiServicePlugin({
        proxyHandler: {
          // Optional: Define proxy handler configuration here
        },
        routes: [
          // Optional: Define custom routes here
        ],
      }),
    ],
  });
  ```

  This feature enhances development workflows by providing a flexible and powerful solution for managing API interactions in a Vite development server environment.

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

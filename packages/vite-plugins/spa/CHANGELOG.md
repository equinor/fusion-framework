# @equinor/fusion-framework-vite-plugin-spa

## 1.0.0-next.0

### Major Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - ---

  **New Package: Fusion Framework Vite SPA Plugin**

  This plugin enables building single-page applications (SPAs) with Vite. It provides features such as service discovery, MSAL authentication, and service worker configuration.

  **Features**:

  - **Service Discovery**: Fetch service discovery configurations and authenticate requests.
  - **MSAL Authentication**: Authenticate users with Azure AD.
  - **Service Worker**: Intercept fetch requests, apply authentication headers, and rewrite URLs.
  - **Custom Templates**: Define custom HTML templates for SPAs.
  - **Environment Configuration**: Configure the plugin using `.env` files or programmatically.

  **Usage**:

  ```ts
  import { defineConfig } from "vite";
  import { plugin as fusionSpaPlugin } from "@equinor/fusion-framework-vite-plugin-spa";

  export default defineConfig({
    plugins: [fusionSpaPlugin()],
  });
  ```

  ```ts
  fusionSpaPlugin({
    generateTemplateEnv: () => ({
      title: "My App",
      portal: {
        id: "my-portal",
      },
      serviceDiscovery: {
        url: "https://my-server.com/service-discovery",
        scopes: ["api://my-app/scope"],
      },
      msal: {
        tenantId: "my-tenant-id",
        clientId: "my-client-id",
        redirectUri: "https://my-app.com/auth-callback",
        requiresAuth: "true",
      },
      serviceWorker: {
        resources: [
          {
            url: "/app-proxy",
            rewrite: "/@fusion-api/app",
            scopes: ["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/.default"],
          },
        ],
      },
    }),
  });
  ```

  **Additional Details**:

  - **Custom Bootstrap**: Allows defining custom bootloader scripts.
  - **Dynamic Proxy**: Supports dynamic proxy services using `@equinor/fusion-framework-vite-plugin-api-service`.
  - **Environment Variables**: Automatically maps `.env` variables to `import.meta.env`.

  Refer to the README for detailed documentation.

### Patch Changes

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - Fetch and pass portal config to portal render function in bootstrap.ts

  - The SPA bootstrap script now fetches the portal config from `/portals/{portalId}@{portalTag}/config` and passes it as `config` to the portal's render function.
  - This enables portals to receive their runtime configuration directly at startup.

- [#3074](https://github.com/equinor/fusion-framework/pull/3074) [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13) Thanks [@odinr](https://github.com/odinr)! - update Vite to 6.3.5

- Updated dependencies [[`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13), [`6b034e5`](https://github.com/equinor/fusion-framework/commit/6b034e5459094cea0c0f2490335eef3092390a13)]:
  - @equinor/fusion-framework-vite-plugin-api-service@1.0.0-next.0
  - @equinor/fusion-framework-module-http@6.3.3-next.0
  - @equinor/fusion-framework-module-service-discovery@8.0.15-next.0

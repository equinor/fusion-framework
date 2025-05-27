---
"@equinor/fusion-framework-vite-plugin-spa": major
---

---

**New Package: Fusion Framework Vite SPA Plugin**

This plugin enables building single-page applications (SPAs) with Vite. It provides features such as service discovery, MSAL authentication, and service worker configuration.

__Features__:

- **Service Discovery**: Fetch service discovery configurations and authenticate requests.
- **MSAL Authentication**: Authenticate users with Azure AD.
- **Service Worker**: Intercept fetch requests, apply authentication headers, and rewrite URLs.
- **Custom Templates**: Define custom HTML templates for SPAs.
- **Environment Configuration**: Configure the plugin using `.env` files or programmatically.


__Usage__:

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
      id: "my-portal"
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

__Additional Details__:

- **Custom Bootstrap**: Allows defining custom bootloader scripts.
- **Dynamic Proxy**: Supports dynamic proxy services using `@equinor/fusion-framework-vite-plugin-api-service`.
- **Environment Variables**: Automatically maps `.env` variables to `import.meta.env`.

Refer to the README for detailed documentation.

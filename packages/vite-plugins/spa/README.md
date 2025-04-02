# Fusion Framework Vite SPA Plugin

This plugin is used to build a single page application (SPA) with Vite.

## Usage

```ts
import { defineConfig } from 'vite';
import { plugin as fusionSpaPlugin } from '@equinor/fusion-framework-vite-plugin-spa';

export default defineConfig({
  plugins: [fusionSpaPlugin()],
});
```

## Configure the plugin

```ts
fusionSpaPlugin({
  generateTemplateEnv: () => {
    return {
      title: 'My App',
      portalId: 'my-portal',
      serviceDiscovery: {
        url: 'https://my-server.com/service-discovery',
        scopes: ['api://my-app/scope'],
      },
      msal: {
        tenantId: 'my-tenant-id',
        clientId: 'my-client-id',
        redirectUri: 'https://my-app.com/auth-callback',
        requiresAuth: 'true',
      },
      serviceWorker: {
        resources: [
          {
            url: '/app-proxy',
            rewrite: '/@fusion-api/app',
            scopes: ['xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/.default'],
        ],
      },
    }
  }
});
```

### Service Discovery

The service discovery URL is used to fetch the service discovery configuration from the server.
The service discovery scopes are used to authenticate the service discovery request.

### MSAL

The MSAL configuration is used to authenticate the user with Azure AD.
- `tenantId` is the ID of the Azure AD tenant.
- `clientId` is the ID of the Azure AD application.
- `redirectUri` is the URL to redirect the user to after authentication.
- `requiresAuth` _(optional)_ property is used to specify if the framework requires authentication, will try to login user on initial load.

### Service Worker

The service worker configuration is used to configure routes for the service worker.

When `fetch` calls are made to the `url` path, the service worker will intercept the request and apply authentication headers to the request for the specified scopes. The request url will be rewritten to the `rewrite` path, by replacing the `url` with the `rewrite` path.

- `resources` is an array of resources which the service worker will handle.
  -  `url` path to match requests to
  -  `rewrite` _(optional)_ path to replace the `url` with
  -  `scopes` _(optional)_ is an array of scopes to use for the resource.

Example:
```ts
const serviceWorker = {
  resources: [
    {
      url: '/app-proxy',
      rewrite: '/@fusion-api/app',
      scopes: [
        '2bed749c-843b-413d-8b17-e7841869730f/.default',
        '8c24cf81-de7a-435b-ab74-e90b1a7bda0a/.default'
      ],
    },
  ],
};

fetch('/app-proxy/assets/some-app/resource-path/resource.json');
```
1. The request will be intercepted by the service worker.
2. The service worker will post message to the main thread for authentication.
3. The main thread will generate the authentication token for the specified scopes.
4. The service worker will rewrite the request to `/@fusion-api/app/assets/some-app/resource-path/resource.json`.
5. The service worker will execute the request to the rewritten path with the authentication token.

> [!TIP]
> The `Url` does not have an endpoint, it is just a path to match the request to, 
> so that url can emulate a proxy service in the production environment.
> The `rewrite` path is the actual endpoint to call.

> [!TIP]
> Using the `@equinor/fusion-framework-vite-plugin-api-service` plugin,
> you can create a dynamic proxy service that will handle the request.
> 
> The `/@fusion-api/app` points to proxy route which can be intercepted in the dev-server. 
> This endpoint is generated from the service discovery configuration and will dynamically proxy the request to the service discovery endpoint.  

## Configuring threw `.env` file

The plugin can be configured threw a `.env` file. The plugin will read the `.env` file and override the properties in the `generateTemplateEnv` function.

The property names are prefixed with `FUSION_SPA_` and snake cased. 

example:

```ts
{
  serviceWorker: {
    resources: [...],
  },
}
// will be converted to
FUSION_SPA_SERVICE_WORKER_RESOURCES: [...],

// and accessible in the template as
import.meta.env.FUSION_SPA_SERVICE_WORKER_RESOURCES
```

> [!TIP]
> Prefer to use the `generateTemplateEnv` function to provide the properties.
> The `.env` file is used to override configurations, example in an CI/CD pipeline.

> [!IMPORTANT]
> The `.env` file should be placed in the root of the project.
> Parameters from the `.env` file overrides the parameters from the `generateTemplateEnv` function.

```
FUSION_SPA_TITLE=My App
FUSION_SPA_PORTAL_ID=my-portal
FUSION_SPA_SERVICE_DISCOVERY_URL=https://my-server.com/service-discovery
FUSION_SPA_SERVICE_DISCOVERY_SCOPES=[api://my-app/scope]
FUSION_SPA_MSAL_TENANT_ID=my-tenant-id
FUSION_SPA_MSAL_CLIENT_ID=my-client-id
FUSION_SPA_MSAL_REDIRECT_URI=https://my-app.com/auth-callback
FUSION_SPA_MSAL_REQUIRES_AUTH=true
FUSION_SPA_SERVICE_WORKER_RESOURCES=[{"url":"/app-proxy","rewrite":"/@fusion-api/app","scopes":["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/.default"]}]
```

## Providing a custom template

> [!WARNING]
> Your almost walking on the edge of the framework. Be careful.
> At this point you might just define your own template and the plugin will inject the properties into the template.

```ts
const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <script type="module" src="./src/my-custom-bootloader"></script>
</head>
<body>
  <h1>%MY_CUSTOM_PROPERTY%</h1>
  <div id="app"></div>
</body>
</html>
`;

import { defineConfig } from 'vite';
import { createViteSPAPlugin } from '@equinor/fusion-framework-vite-plugin-spa';

const templateEnvPrefix = 'MY_CUSTOM_';

export default defineConfig({
  define: {
    `import.meta.env.${templateEnvPrefix}PROPERTY`: 'my-custom-value',
  },
  plugins: [createViteSPAPlugin({template, templateEnvPrefix})],
});
```

> [!TIP]
> see [Vite documentation](https://vite.dev/guide/env-and-mode.html#html-constant-replacement) for more information about customizing the template.

### Providing custom bootstrap

```ts
fusionSpaPlugin({
  generateTemplateEnv: () => {
    return {
      bootstrap: 'src/my-custom-bootloader.ts',
    }
  }
});
```

> [!WARNING]
> The bootstrapping of the `ServiceWorker` is done in the the bootloader, 
> this functionality will no longer be available, but needs to be re-implemented in the custom bootloader.


```ts
// custom-bootloader.ts
import { registerServiceWorker} from '@equinor/fusion-framework-vite-plugin-spa/html';

import initializeFramework from './my-custom-framework.js';

registerServiceWorker(await initializeFramework());
```



## Dev Portal

This package provides a development portal for the Fusion framework.

This Portal only contains the bare minimum to get started with the Fusion Application development. Visuals might differ from the production portal.

It is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.
This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and is not intended for direct use in production.

## Installation

```sh
pnpm add @equinor/fusion-framework-dev-portal
```

## Environment Variables

The following environment variables must be set in `.env` or in the environment variables of the server:

- FUSION_MSAL_CLIENT_ID: The client ID for MSAL authentication.
- FUSION_MSAL_TENANT_ID: The tenant ID for MSAL authentication.
- FUSION_SERVICE_DISCOVERY_URL: The URL for service discovery.
- FUSION_SERVICE_SCOPE: The scopes for the service.
- FUSION_SPA_AG_GRID_KEY: (Optional) AG Grid Enterprise license key for local development. When provided, this eliminates AG Grid license console warnings when running the portal locally with AG Grid-enabled features.

### Local AG Grid Configuration

To use AG Grid Enterprise features without console warnings during local development:

1. Obtain an AG Grid Enterprise license key from your organization
2. Add the key to your `.env` file:
   ```sh
   FUSION_SPA_AG_GRID_KEY=your-license-key-here
   ```
3. Start the dev portal:
   ```sh
   pnpm start
   ```
4. Verify the configuration by opening the portal and checking the browser console - there should be no AG Grid license warnings

**Note**: The license key is only used for local development and is never committed to the repository or deployed to production.

## Development

```sh
pnpm start
```

## Usage

```ts
import { render } from "@equinor/fusion-framework-dev-portal";

const el = document.createElement("div");
el.id = "dev-portal";
document.body.appendChild(el);

const framework = /** Fusion Framework, [Service Discovery, MSAL] */;

render(el, {ref: framework});
```

### Usage with `@equinor/fusion-framework-dev-server`

```ts
import { createDevServer } from "@equinor/fusion-framework-dev-server";

const portalId = '@equinor/fusion-framework-dev-portal';
const devServer = await createDevServer({
  spa: {
    templateEnv: {
      portal: {
        id: portalId,
        tag: 'latest',
      }
      /** --- Add any other environment variables you need here --- */
    },
  },
  api: {
    serviceDiscoveryUrl: "https://location.of.your.service.discovery",
    processServices: /** generate proxy routes */
    routes: [
      {
        // intercept for the dev-portal manifest
        match: `/PROXY_SERVICE_KEY/PROXY_PATH/${options.portal}{@:tag}`,
        middleware: async (req, res) => {
          res.writeHead(200, { 'content-type': 'application/json' });
          // resolve the local path to the dev-portal
          // __CWD__/node_modules/@equinor/fusion-framework-dev-portal/dist/main.js
          const path =  fileURLToPath('/@fs' + import.meta.resolve(portalId));
          const manifest = {
            build: { 
              entrypoint: new URL(path, req.headers.referer), 
            }
          }
          res.end(JSON.stringify(manifest));
        },
      }
    ]
  },
});
```



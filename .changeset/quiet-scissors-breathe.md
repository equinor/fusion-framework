---
'@equinor/fusion-framework-cli': minor
---

**@equinor/fusion-framework-cli**

The `appProxyPlugin` is a Vite plugin designed to proxy requests to a Fusion app backend.
It sets up proxy rules for API and bundle requests and serves the app configuration and manifest based on the app key and version.

Key Features:

1. Proxy Configuration:

    - Proxies API calls to the Fusion apps backend.
    - Proxies bundle requests to the Fusion apps backend.
    - Uses a base path `proxyPath` for proxying.
    - Captures and reuses authorization tokens for asset requests.

2. **App Configuration and Manifest**:

    - Serves the app configuration if the request matches the current app and version.
    - Serves the app manifest if the request matches the current app.

3. **Middleware Setup**:
    - Sets up middleware to handle requests for app configuration, manifest, and local bundles.

This plugin is used by the CLI for local development, but design as exportable for custom CLI to consume applications from other API`s

example configuration:
```typescript
const viteConfig = defineConfig({
    // vite configuration
    plugins: [
        appProxyPlugin({
            proxy: {
                path: '/app-proxy',
                target: 'https://fusion-s-apps-ci.azurewebsites.net/',
                // optional callback when matched request is proxied
                onProxyReq: (proxyReq, req, res) => {
                    proxyReq.on('response', (res) => { console.log(res.statusCode) });
                },
            },
            // optional, but required for serving local app configuration, manifest and resources
            app: {
                key: 'my-app',
                version: '1.0.0',
                generateConfig: async () => ({}),
                generateManifest: async () => ({}),
            },
        }),
    ],
});
```

example usage:
```typescript
// Example API calls
fetch('/app-proxy/apps/my-app/builds/1.0.0/config'); // local
fetch('/app-proxy/apps/my-app/builds/0.0.9/config'); // proxy
fetch('/app-proxy/apps/other-app/builds/1.0.0/config'); // proxy

// Example asset calls
fetch('/app-proxy/bundles/my-app/builds/1.0.0/index.js'); // local
fetch('/app-proxy/bundles/my-app/builds/0.0.9/index.js'); // proxy
```


## App Proxy Plugin

The `App Proxy Plugin` is a Vite plugin that allows you to proxy requests to the Fusion App Service. This plugin is essential when developing applications that require assets from the Fusion App Service. It intercepts requests to the Fusion App Service and injects the necessary headers to authenticate the request.

Additionally, this plugin intercepts requests to the Fusion App Service to generate local app manifest and configuration files. It also resolves SPA routing to the local source code.

> [!WARNING]
> The `App Proxy Plugin` is only available in development mode. 
> It is not recommended to use this plugin in production. 
> The plugin will cache the user authentication token in the node process memory. This is necessary to authenticate asset requests to the Fusion App Service, since there is no valid cookie for the development domain.

### Configuration

The `App Proxy Plugin` can be configured by passing an object to the plugin. The following options are available:

**proxy**

- `target` - The target URL of the Fusion App Service. This is required.
- `path`- url path to intercept and proxy to the Fusion App Service.
- `onProxyReq` - A function that will be called before the request is sent to the Fusion App Service. This is optional.

**app** _[optiontional]_

> [!NOTE]
> When no app configuration is provided, all request on `path` will be intercepted and proxy to the Fusion App Service.

- `key`: The app key of the application.
- `version`: The build version of the application.
- `generateManifest` - A callback function that will be called to generate the app manifest.
- `generateConfig` - A callback function that will be called to generate the app configuration.

### Example

```typescript
export default defineConfig({
  plugins: [
    appProxyPlugin({
      proxy: {
        path: '/app-proxy',
        target: 'https://fusion-s-apps-ci.azurewebsites.net/',
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.on('response', (res) => { console.log(res.statusCode) });
        },
      },
      app: {
        key: 'my-app',
        version: '1.0.0',
        generateConfig: async () => ({}),
        generateManifest: async () => ({}),
      },
    })
  ]
})
```

**Example API Requests**
```typescript
// will generate app config by provided function
fetch('/app-proxy/apps/my-app/builds/1.0.0/config'); 

// will proxy to the target, since version does not match
fetch('/app-proxy/apps/my-app/builds/0.0.9/config'); 

// will proxy to the target, since app key does not match
fetch('/app-proxy/apps/other-app/builds/1.0.0/config'); 
```

**Example Asset Requests**
```typescript
// will generate bundle by provided function
fetch('/app-proxy/bundles/my-app/builds/1.0.0/index.js'); 

// will proxy to the target, since version does not match
fetch('/app-proxy/bundles/my-app/builds/0.0.9/index.js'); 
```



# Help Proxy Plugin

The `Help Proxy Plugin` is a Vite plugin that allow you to proxy requests to the
Fusion Help Service. This plugin is essential when developing applications that
require assets from the Fusion Help Service. It intercepts requests to the
Fusion Help Service and injects the necessary headers to authenticate the
request.

> !WARNING
> The `Help Proxy Plugin` is only available in development mode.
> It is not recommended to use this plugin in production.
> The plugin will cache the user authentication token in the node process
> memory. This is necessary to authenticate asset requests to the Fusion Help
> Service, since there is no valid cookie for the development domain.

### Configuration

The `Help Proxy Plugin` can be configured by passing an object to the plugin.
The following options are available:

`proxy`

- `target` - The target URL of the Fusion Help Service. This is _required_.
- `path` - URL path to intercept and proxy to the Fusion Help Service. This is _required_.
- `onProxyReq` - A function that will be called before the request is sent to the
  Fusion Help Service. This is _optional_.

### Example

```typescript
export default defineConfig({
  plugins: [
    helpProxyPlugin({
      proxy: {
        path: '/help-proxy',
        target: 'https://help.ci.api.fusion-dev.net/',
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.on('response', (res) => { console.log(res.statusCode) });
        },
      },
    })
  ]
});
```

#### Example Asset Requests
```typescript
// Fetch a resource through the proxy
fetch('/help-proxy/assets/resources/images/image.jpg');
```

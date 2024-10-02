## External Public Plugin
This plugin is useful for serving a static site from a directory different from where the Vite server is running.

Vite's built-in `mode: 'spa'` only looks for the `index.html` file in the configured `root` directory. Therefore, this plugin is necessary to serve the `index.html` file from an alternative directory.


### How it works

The plugin will intercept requests to the Vite server and serve the static files from the specified directory. If the requested file is not found in the specified directory, the request will be passed to the Vite server to handle.

> [!NOTE]
> The middleware will first check if a file by the same name exists in the runtime root directory. This is to prevent hijacking requests to the Vite dev server. 
> example: `/asset/cute-cat.jpg` can be both in the `publicDir` and the external directory. The middleware will first check the `publicDir` and `root` before checking the external directory.
>
> **A good practice is to use content hash on external assets to prevent conflict**

The plugin will serve the `index.html` file from the specified directory when the requested file is not found. This is required for single-page applications (SPAs) that use client-side routing.


### Configuration

The `External Public Plugin` can be configured by passing an object to the plugin. The following options are available:

- `path` - The path to static files that should be served by the Vite server. This is required.

```typescript
export default defineConfig({
  plugins: [
    externalPublicPlugin('./my-static-site/demo-portal')
  ]
});
```

**Filtering**

```typescript
externalPublicPlugin('./my-static-site/demo-portal', {
  exclude: /\.(ts|tsx)$/
})
```

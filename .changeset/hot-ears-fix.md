---
'@equinor/fusion-framework-cli': minor
---

**@equinor/fusion-framework-cli:**

Create a plugin `externalPublicPlugin` to fix the issue with serving the `index.html` file from the specified external public directory. Vite mode `spa` will not serve the `index.html` file from the specified external public directory.

-   Enhanced the middleware to intercept requests and serve the `index.html` file from the specified external public directory.
-   Transformed the HTML using Vite's `transformIndexHtml` method.
-   Applied appropriate content headers and additional configured headers before sending the response.

```typescript
const viteConfig = {
  roo
    plugins: [
        // path wich contains the index.html file
        externalPublicPlugin('./my-portal'),
    ],
};

const viteConfig = defineConfig({
    // vite configuration
    root: './src', // this where vite will look for the index.html file
    plugins: [
        // path which contains the index.html file
        externalPublicPlugin('./my-portal'),
    ],
});
```

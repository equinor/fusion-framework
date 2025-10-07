---
"@equinor/fusion-framework-cli": patch
---

Enhanced dev server host configuration to respect Vite config settings.

- Modified `startAppDevServer` function in `app-dev.ts` to use host configuration from local Vite config
- Changed hardcoded 'localhost' host to respect `localViteConfig.server?.host` with 'localhost' as fallback
- Improved configuration loading by storing `localViteConfig` in a variable to avoid duplicate loading
- This allows developers to configure custom host settings (like '0.0.0.0' for network access) through their Vite config

**How this affects consumers**

Developers can now configure the dev server host through their local `vite.config.ts` file:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0', // Allow network access
    // or host: 'localhost' for local-only access
  },
});
```

Previously, the host was always hardcoded to 'localhost', preventing network access to the dev server.

ref: [3548](https://github.com/equinor/fusion-framework/issues/3548)

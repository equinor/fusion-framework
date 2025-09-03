---
"@equinor/fusion-framework-dev-server": patch
---

Enhanced dev server configuration by removing `vite-tsconfig-paths` plugin.

> The responsibility for adding the `vite-tsconfig-paths` plugin has been moved to `@equinor/fusion-framework-cli`, which now provides it via the `overrides` parameter in `createDevServerConfig`. This ensures consistent TypeScript path resolution in both development and build environments.  

- Removed `vite-tsconfig-paths` dependency from package.json
- Removed plugin usage from `create-dev-server-config.ts`


**Breaking change:** 

If you use `@equinor/fusion-framework-dev-server` outside of the CLI, you must manually add the `vite-tsconfig-paths` plugin to your Vite config overrides to maintain the same TypeScript path resolution behavior.

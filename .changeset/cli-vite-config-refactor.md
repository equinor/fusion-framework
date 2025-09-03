---
"@equinor/fusion-framework-cli": patch
---

Enhanced Vite configuration with improved TypeScript path resolution and centralized config loading.

- Added `vite-tsconfig-paths` plugin for better TypeScript path resolution in development
- Refactored app and portal dev servers to use centralized `loadViteConfig` function
- Improved Vite config merging with `mergeConfigVite` for better configuration management
- Added debug logging for Vite and dev server configurations
- Moved output directory validation to build-time only for better performance

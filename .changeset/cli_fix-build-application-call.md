---
"@equinor/fusion-framework-cli": patch
---

Fixed missing `env` parameter in `buildApplication` call within `bundleApp` function.

- Added the required `env` parameter to the `buildApplication` function call in `packages/cli/src/bin/app-pack.ts`
- This ensures the build process receives the correct runtime environment configuration

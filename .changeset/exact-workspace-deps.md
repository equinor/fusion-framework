---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-server": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Updated workspace dependencies to use exact version specifiers for consistent release behavior.

- Changed workspace dependencies from `workspace:^` to `workspace:*` across CLI, dev-server, and SPA vite plugin packages
- Ensures exact version resolution within the monorepo for predictable builds and releases
- Affects both dependencies and devDependencies where applicable

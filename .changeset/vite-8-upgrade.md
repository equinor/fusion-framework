---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-dev-server": patch
"@equinor/fusion-framework-vite-plugin-api-service": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Bump `vite` from `7.3.1` to `8.0.0`.

Vite 8 replaces Rollup with Rolldown and esbuild with Oxc for faster builds.
No breaking API changes affect this codebase. The `dev-server` peerDependency
is widened to accept both Vite 7 and Vite 8.

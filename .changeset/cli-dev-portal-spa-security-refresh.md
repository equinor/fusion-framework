---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Internal: rebuild the CLI, dev portal, and SPA plugin with patched security dependency resolutions from the workspace lockfile, including the Rollup security update and related transitive fixes. No public API changes.
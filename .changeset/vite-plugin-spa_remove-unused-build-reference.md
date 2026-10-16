---
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Internal: remove the unused services-module TypeScript project reference. It was not a workspace dependency, so parallel builds could compile the services output twice while Turbo cached it, retaining incomplete JavaScript and source maps.

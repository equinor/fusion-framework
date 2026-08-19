---
"@equinor/fusion-observable": patch
---

Fix relative import/export specifiers in the published ESM output missing file extensions (e.g. `./operators` instead of `./operators/index.js`). This broke strict Node.js ESM resolution for consumers not using a bundler (e.g. `vitest` running against `node_modules` directly), producing errors like `Cannot find module '.../operators'`.

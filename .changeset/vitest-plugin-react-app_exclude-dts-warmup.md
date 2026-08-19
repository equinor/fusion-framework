---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Exclude `.d.ts` files from the default `server.warmup.clientFiles` and `optimizeDeps.entries`
globs in `defineProject`. Previously, an app shipping a CJS-style declaration file (for example
one using `export =`) failed the Vite warmup scan, since it was loaded as ESM.

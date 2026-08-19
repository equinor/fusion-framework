---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Fix `defineProject` not pre-transforming lazily/code-split-imported source (e.g. route
components reached only through dynamic `import()`), which could force Vite to reload the
page mid-test and fail the in-flight test file's import.

`defineProject`'s Vite config now sets `server.warmup.clientFiles: ['src/**/*.{ts,tsx}']`, so
all source under `src/` is transformed up front instead of on first request.

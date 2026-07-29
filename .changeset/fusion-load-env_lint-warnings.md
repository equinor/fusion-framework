---
"@equinor/fusion-load-env": patch
---

Internal: resolve `fusion-lint` warnings (`require-intent-comment`, `single-export-per-file`) by adding intent comments to control-flow blocks, loops, and iterator chains, and co-locating `loadEnv` with `getEnvFilesForMode`.

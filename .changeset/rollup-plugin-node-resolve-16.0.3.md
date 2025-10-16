---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

chore: bump @rollup/plugin-node-resolve from 16.0.1 to 16.0.3

Bug fixes:
- fix: resolve bare targets of package "imports" using export maps; avoid fileURLToPath(null)
- fix: error thrown with empty entry

---
"@equinor/fusion-framework-cli": patch
---

Updated `vite` from `8.0.16` to `8.1.5`.

Notable changes:
- `server.fs.deny` extended with common sensitive files (security hardening)
- New `caseSensitive` option for `import.meta.glob`
- WASM ESM Integration (direct `.wasm` imports)
- `html.additionalAssetSources` option
- Various bug fixes across HMR, CSS, SSR, and dev server

---
"@equinor/fusion-framework-dev-portal": patch
---

Remove the development portal's own temporary light-mode lock, including the
root `color-scheme: only light` style and the `data-color-scheme="light"`
attribute on `html`. Native browser controls stay light through
`@equinor/fusion-web-theme@0.1.12`, but that package does not select the modern
EDS palette, so EDS colors now follow the OS or browser color-scheme preference.

Ref: equinor/fusion-core-tasks#2120.

Internal: bump locked Rollup from 4.65.1 to 4.67.4 for the Vite build toolchain.

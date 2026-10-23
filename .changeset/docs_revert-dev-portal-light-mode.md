---
"@equinor/fusion-framework-docs": patch
---

Remove documentation of the development portal's temporary light-only policy.
The portal no longer sets `data-color-scheme="light"`, so the modern EDS palette
follows the OS or browser preference; only the native-control lock remains, via
`@equinor/fusion-web-theme@0.1.12`.

Ref: equinor/fusion-core-tasks#2120.

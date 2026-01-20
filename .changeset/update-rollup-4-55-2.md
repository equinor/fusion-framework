---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Internal: update rollup build dependency from 4.52.5 to 4.55.2.

This update includes:
- Improved circular dependency handling for manual chunks
- Enhanced tree-shaking for Symbol properties
- Performance improvements via variable name caching
- Multiple bug fixes for build edge cases

No changes to CLI or plugin functionality or public APIs.

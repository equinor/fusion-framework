---
"@equinor/fusion-framework-module-context": patch
---

Restore path-based resolution as a fallback in `resolveInitialContext`, composed with parent-context resolution. The context-navigation plugin introduced in #4751 removed this from the module, but consumers not yet migrated to the plugin lost initial-context resolution from the URL. `resolveInitialContext` now accepts a `path` option (`extract`/`validate`) used to resolve context from the URL before falling back to the parent context.

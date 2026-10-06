---
"@equinor/fusion-framework-module-services": patch
---

Restore the `@equinor/fusion-framework-module-services/errors` sub-path. It again exports `UnsupportedApiVersion`; the entry file was lost when the error classes were split into separate files.

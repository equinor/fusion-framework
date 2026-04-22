---
"@equinor/fusion-framework-react-router": patch
---

External: export additional packages from react-router that apps may require to operate without needing react-router installed.

Internal: sort barrel exports in the router package index for deterministic ordering; no public API or runtime behavior changes.

---
"@equinor/fusion-framework-react-router": patch
---

External: re-export additional React Router symbols that apps may require to operate without needing `react-router` installed.

Internal: sort barrel exports in the router package index for deterministic ordering; this sorting change does not change runtime behavior or the public API.

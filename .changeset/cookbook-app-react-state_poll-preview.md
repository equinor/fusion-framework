---
"@equinor/fusion-framework-cookbook-app-react-state": patch
---

`SyncStatusIndicator` now recognizes the `onStateSync.poll` event kind, and the cookbook's default (non-`FUSION_SPA_COUCHDB_URL`) storage now overrides `pull.intervalMs` to 10s via `createDefaultStorage`, so a scheduled pull is visible while previewing the cookbook instead of waiting on the framework's 60s production default.

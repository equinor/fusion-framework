---
"@equinor/fusion-framework-module-state": patch
---

Stop the default app-state sync from requesting the unsupported `/sync/` root on the Fusion App State service.

PouchDB looks up the CouchDB server root to read a server `uuid` each time a replication starts (the live push and every scheduled pull). The default storage forwarded that lookup as `GET {app-state}/sync/`, which the service does not route, so apps logged a `404` network error on every pull poll. The lookup is now answered locally with an empty response, which matches PouchDB's existing fallback, so replication checkpoint IDs stay the same and no re-sync happens. App-scoped `/sync/{appKey}/...` requests and genuine authentication, network and replication errors are unchanged.

Fixes: https://github.com/equinor/fusion/issues/984
Ref: https://github.com/equinor/fusion-core-tasks/issues/2221

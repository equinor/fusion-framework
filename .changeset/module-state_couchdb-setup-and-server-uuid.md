---
"@equinor/fusion-framework-module-state": patch
---

Let the default app-state sync use PouchDB's standard CouchDB setup and the App State backend's server identity.

- First-time users no longer get `404 Database does not exist` on every pull until their first write. PouchDB's existence check (`GET` → `404` → `PUT`) now runs, and the backend provisions the per-user database.
- The server-root lookup (`GET {app-state}/sync/`) is forwarded, so the replication checkpoint ID uses the backend's pinned server `uuid`. Existing clients re-scan each app database once after upgrading. No data is lost.

Requires an App State backend with equinor/fusion-core-services#2459 deployed. Older backends answer the setup `PUT` with `400`, which stops sync.

Fixes: https://github.com/equinor/fusion/issues/984
Ref: https://github.com/equinor/fusion-core-tasks/issues/2221

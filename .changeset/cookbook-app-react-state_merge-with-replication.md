---
"@equinor/fusion-framework-cookbook-app-react-state": major
---

Merged the `app-react-state` and `app-react-state-replication` cookbooks into one comprehensive
`@equinor/fusion-framework-cookbook-app-react-state` cookbook covering the full
`@equinor/fusion-framework-module-state` surface:

- **Basics** page: `useAppState` fundamentals - boolean, string, and optional state with no
  `defaultValue` - using the state module's own zero-config default storage.
- **Profile** and **Todos** pages: object and list state, now optionally upgraded to CouchDB
  replication via `PouchDbSyncStorage` when `FUSION_SPA_COUCHDB_URL` is set (see `.env.example`)
  - unset, the cookbook runs with no Docker/CouchDB setup required.
- Replaced the cookbook's custom `app-state-with-replication` module (a hand-rolled
  `StateProvider`/sync-event reimplementation) with the framework's own `PouchDbSyncStorage` and
  native `onStateSync.status` / `onStateSync.change` / `onStateSync.complete` / `onStateSync.error`
  events, dispatched through the app's `event` module.
- Removed `predev`'s automatic CouchDB startup - `pnpm couchdb:start` is now an explicit, optional
  step for trying the replication demo.
- The `SyncStatusMonitor`/`SyncEventList`/`SyncStatusIndicator` components now consume the
  framework's `useStateSyncEvents` hook (`@equinor/fusion-framework-react-app/state`) instead of a
  cookbook-local hook/Context reimplementation of the same subscription logic.
- Simplified `ProfileManager` from 10 files (a `@equinor/fusion-observable` reducer, action
  creators, and seven single-field presentational components) down to a single component using
  plain `useAppState` + immutable object spreads, matching the pattern already used by the
  `Basics` and `Todos` pages - and dropped the now-unused `@equinor/fusion-observable` dependency.
- Removed leftover debug `console.log`s and dead types (`SyncStatus`, `ReplicationSettings`) left
  over from the pre-merge, hand-rolled sync implementation.

# @equinor/fusion-framework-cookbook-app-react-state

## 1.0.3

### Patch Changes

- 9ae5d8b: Internal: bump `styled-components` from `6.5.1` to `6.5.3`.
- 72874ef: Internal: bump `uuid` from `14.0.1` to `14.0.2`.

## 1.0.2

### Patch Changes

- f663b46: Internal: promote packages already published on the `next` prerelease channel to their stable versions.
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
- Updated dependencies [f663b46]
  - @equinor/fusion-framework-cli@15.3.0
  - @equinor/fusion-framework-module-event@6.1.0
  - @equinor/fusion-framework-react-app@14.1.0

## 1.0.1

### Patch Changes

- 55c95fa: Internal: bump `@types/uuid` from `^10.0.0` to `^11.0.0`.
- 46f53ca: `SyncStatusIndicator` now recognizes the `onStateSync.poll` event kind, and the cookbook's default (non-`FUSION_SPA_COUCHDB_URL`) storage now overrides `pull.intervalMs` to 10s via `createDefaultStorage`, so a scheduled pull is visible while previewing the cookbook instead of waiting on the framework's 60s production default.
- fd873c7: Internal: migrate routing to the Fusion route DSL (`layout`/`index`/`route` from `@equinor/fusion-framework-react-router/routes`), matching the pattern demonstrated in the router cookbook. Also fix the sidebar active-link check to match sub-paths (e.g. `/todos/*`) instead of only the exact page path.
- Updated dependencies [55c95fa]
- Updated dependencies [46f53ca]
  - @equinor/fusion-framework-module-state@2.0.0
  - @equinor/fusion-framework-react-app@14.0.0

## 1.0.0

### Major Changes

- b92698d: Merged the `app-react-state` and `app-react-state-replication` cookbooks into one comprehensive
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

### Patch Changes

- Updated dependencies [0d6ef3a]
- Updated dependencies [020d9e5]
- Updated dependencies [0d9d876]
- Updated dependencies [05586e7]
- Updated dependencies [b92698d]
- Updated dependencies [b92698d]
  - @equinor/fusion-framework-module-state@1.0.0
  - @equinor/fusion-framework-react-app@13.0.0

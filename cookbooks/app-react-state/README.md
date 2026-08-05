# Fusion Framework State Cookbook

A cookbook demonstrating `@equinor/fusion-framework-module-state` and the `useAppState` hook -
from a zero-config `useState`-like default, to real-time replication with a remote CouchDB.

## 🎯 Learning Objectives

After working through this cookbook, you will understand:

- How to read and write persistent state with `useAppState`, and when to give it a `defaultValue`
- That the state module works with **no configuration at all** - `enableAppState(appConfigurator)`
  is enough to get local, persistent storage
- How to opt in to CouchDB replication via `PouchDbSyncStorage`, for offline-first, multi-tab, and
  multi-device sync
- How to observe the framework's `onStateSync.*` events to build sync-status UI
- Best practices for naming state keys, typing state, and validating complex state shapes

## 🏗️ Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- Docker (only if you want to try the CouchDB replication demo)

### Quick Start

```bash
pnpm install
pnpm dev
```

That's it - no database or Docker setup required. Every page uses `useAppState` with the state
module's own default storage (a local, per-app PouchDB database with no remote sync), the same
zero-config behavior any consuming app gets.

### Optional: Local CouchDB Replication Demo

The `Profile` and `Todos` pages, and the sync-event indicators shown across the app, are far more
interesting with real replication - open the app in two browser tabs and watch changes in one
appear in the other. To try that:

```bash
pnpm couchdb:start                        # starts a local CouchDB in Docker
cp .env.example .env                      # sets FUSION_SPA_COUCHDB_URL
pnpm dev                                  # restart so Vite picks up the new .env
```

- CouchDB admin UI: <http://localhost:5984/_utils> (`admin` / `admin`)
- Stop it with `pnpm couchdb:stop`, or remove the container and volume with `pnpm couchdb:clean`

Unset `FUSION_SPA_COUCHDB_URL` (or delete `.env`) to go back to the zero-config default storage.

## 📚 Key Concepts

### Default Storage vs. CouchDB Replication

`enableAppState` (from `@equinor/fusion-framework-react-app/state`) registers the state module and
scopes it to the app's own key. Unless you call `config.setStorage(...)`, the module resolves its
**own default storage**: a local PouchDB database, optionally upgraded to sync with the Fusion App
State backend when the app also has `serviceDiscovery` and `http` configured. In a standalone
cookbook like this one, that means local-only, persistent, per-browser storage out of the box.

`PouchDbSyncStorage` (from `@equinor/fusion-framework-module-state/storage`) is what you reach for
when you *do* want replication - it takes a local database, a remote database, and
`PouchDB.Replication.SyncOptions`, and keeps the two in continuous, bidirectional sync:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │     PouchDB      │    │    CouchDB      │
│                 │    │  (Local Store)   │    │  (Remote DB)    │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ useAppState │◄┼────┼► Local Storage   │◄───┼► Remote Storage │
│ │   Hooks     │ │    │                  │    │                 │
│ └─────────────┘ │    │ • Offline-first  │    │ • Persistence   │
│                 │    │ • Instant UI     │    │ • Multi-user    │
│ • UI Updates    │    │ • Auto-sync      │    │ • Backup        │
│ • User Actions  │    │ • Conflict res.  │    │ • HTTP API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

See [`src/config.ts`](./src/config.ts): it enables `PouchDbSyncStorage` only when
`FUSION_SPA_COUCHDB_URL` is set, otherwise it calls `enableAppState(appConfigurator)` with no
`configure` callback at all.

### State Management with useAppState

Use `useAppState` just like React's `useState`, but with automatic persistence (and replication,
if configured):

```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const [state, setState] = useAppState<MyState>('my.state.key', {
  defaultValue: {
    value: '',
    updatedAt: new Date().toISOString(),
  },
});

// Updates are persisted (and replicated, when CouchDB sync is configured) automatically
setState((prev) => ({
  ...prev,
  value: 'New Value',
  updatedAt: new Date().toISOString(),
}));
```

Omit `defaultValue` and the state starts as `undefined` until something sets it - useful for state
that genuinely doesn't exist yet, like `user.lastLogin`.

### Observing Sync Events

When CouchDB replication is enabled, the state module dispatches `onStateSync.status`,
`onStateSync.change`, `onStateSync.complete`, and `onStateSync.error` events through the app's
`event` module. `@equinor/fusion-framework-react-app`'s `useStateSyncEvents` hook subscribes to
them for you and returns a bounded, typed event log -
[`src/components/SyncEvents/SyncStatusMonitor.tsx`](./src/components/SyncEvents/SyncStatusMonitor.tsx)
shows the pattern:

```typescript
import { useStateSyncEvents } from '@equinor/fusion-framework-react-app/state';

const events = useStateSyncEvents(20);
const lastEvent = events.at(-1);
```


## 🔍 Code Structure

```text
src/
├── App.tsx                  # Main application entry point
├── config.ts                # State module setup - default storage vs. CouchDB replication
├── index.ts                 # App bootstrap
├── Router.tsx                # Route tree (basics, profile, todos)
├── components/
│   ├── ProfileManager/       # Profile management
│   ├── SyncEvents/           # Replication status and event log
│   └── Todo/                 # Todo list
└── pages/
    ├── Basics.tsx            # useAppState fundamentals - boolean, string, optional state
    ├── Home.tsx               # Overview and navigation
    ├── Profile.tsx            # Object state with replication
    └── Todo.tsx               # List state with replication
```

## 🧪 Examples in This Cookbook

### 1. Basics

The fundamentals of `useAppState` - a boolean, a string, and an optional value with no
`defaultValue` - before the replicated pages layer sync on top.

### 2. Profile Manager

- **User profile data** - name, email, preferences
- **Reducer pattern** - manage complex state transitions
- **Real-time updates** - changes sync across browser tabs when CouchDB replication is enabled
- **Conflict resolution** - last-write-wins strategy

### 3. Sync Status Monitor

Real-time monitoring of replication status, built entirely on the framework's `onStateSync.*`
events (see [Observing Sync Events](#observing-sync-events)):

- 🟢 Active - syncing
- 🔵 Paused - up to date, waiting for changes
- 🔴 Error - connection or replication failure

### 4. Todo List

- **CRUD operations** - create, read, update, delete todos
- **Optimistic updates** - instant UI feedback
- **Conflict resolution** - handles concurrent edits

## 🔧 Advanced Configuration

### Custom Sync Options

Fine-tune replication behavior via `PouchDbSyncStorage`'s `syncOptions`
(`PouchDB.Replication.SyncOptions`):

```typescript
new PouchDbSyncStorage({
  localDb: { name_or_instance: 'cookbook_app_state' },
  remoteDb: { name_or_instance: couchdbUrl },
  syncOptions: {
    live: true, // Enable continuous replication
    retry: true, // Retry on connection failure
    heartbeat: 10000, // Heartbeat interval (ms)
    timeout: 30000, // Request timeout (ms)
  },
});
```

### Troubleshooting

1. **CouchDB connection refused**

   ```bash
   curl http://localhost:5984/     # check if CouchDB is running
   pnpm couchdb:stop && pnpm couchdb:start
   ```

2. **Nothing syncs, but no errors either** - confirm `.env` exists (copied from `.env.example`)
   and that `pnpm dev` was restarted after creating it; Vite only reads `.env` at startup.

3. **Authentication errors** - verify credentials `admin` / `admin` against
   <http://localhost:5984/_utils>.

## 💡 Best Practices

### 1. State Key Organization

Use hierarchical naming for better organization:

```typescript
// ✅ Good - hierarchical, descriptive
'user.profile.personal'
'user.preferences.theme'
'app.settings.notifications'
'feature.dashboard.filters'

// ❌ Avoid - flat, unclear
'userdata'
'settings'
'stuff'
```

### 2. Use Strong Typing

```typescript
// ✅ Good - strong typing
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useAppState<UserProfile>('user.profile');

// ❌ Avoid - weak typing
const [user, setUser] = useAppState('user.profile');
```

### 3. Validate Complex Schemas

```typescript
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

type UserProfile = z.infer<typeof userSchema>;

// ✅ Good - strong typing with validation
const useMyUser = () => {
  const [value, setValue] = useAppState<UserProfile>('user.profile');
  const setUser = useCallback(
    (user: UserProfile) => {
      if (userSchema.safeParse(user).success) {
        setValue(user);
        return true;
      }
      console.warn('Provided user is invalid');
      return false;
    },
    [setValue],
  );
  if (value !== undefined && !userSchema.safeParse(value).success) {
    console.warn('Current user state is invalid');
    return [null, setUser] as const;
  }
  return [value, setUser] as const;
};
```

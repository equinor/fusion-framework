# Fusion Framework CouchDB State Replication Cookbook

A comprehensive cookbook demonstrating real-time state synchronization between React applications and CouchDB using the Fusion Framework state module with PouchDB replication.

## 🎯 Learning Objectives

After working through this cookbook, you will understand:

- How to configure CouchDB replication with the Fusion Framework state module
- How to set up local CouchDB using Docker for development
- How to implement bidirectional state synchronization between apps and databases
- How to handle offline-first scenarios with automatic sync when online
- Best practices for conflict resolution and error handling in distributed state

## 🏗️ Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- Docker and Docker Compose
- Basic knowledge of React hooks and CouchDB concepts

### Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

3. **Access CouchDB Admin UI:**
   - URL: http://localhost:5984/_utils
   - Username: `admin`
   - Password: `admin`

4. **Test the replication:**
   - Open the app in multiple browser tabs
   - Make changes on `profile` or `todos` page and watch them appear in others!

### Docker Commands

```bash
# Start CouchDB
pnpm couchdb:start

# Stop CouchDB
pnpm couchdb:stop

# View CouchDB logs
pnpm couchdb:logs

# Clean up (stop, remove container and volume)
pnpm couchdb:clean
```

## 📚 Key Concepts

### State Replication Architecture

This cookbook demonstrates a complete offline-first architecture:

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

### Configuration Overview

The application's CouchDB replication is configured in [`src/config.ts`](./src/config.ts). This file sets up both the local PouchDB instance (for offline-first storage) and the remote CouchDB database (for synchronization), and wires them into the Fusion Framework state module.

Key steps in the configuration:

- **Local Database:** A PouchDB instance named `cookbook_app_state` is created for browser storage with auto-compaction enabled.
- **Remote Database:** A remote PouchDB instance connects to CouchDB at `http://localhost:5984/cookbooks_app_state` using admin credentials.
- **Module Integration:** The custom state module is enabled with these databases, allowing automatic bidirectional sync.
- **Navigation:** The navigation module is also enabled for multi-page support.

See the full configuration in [`src/config.ts`](./src/config.ts) for implementation details.

### State Management with useAppState

Use the `useAppState` hook just like React's `useState`, but with automatic persistence and replication:

```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const [state, setState] = useAppState<MyState>('my.state.key', {
  defaultValue: {
    value: '',
    updatedAt: new Date().toISOString(),
  },
});

// Any updates to state are persisted and replicated automatically
setState(prev => ({
  ...prev,
  value: 'New Value',
  updatedAt: new Date().toISOString(),
}));
```

## 🔍 Code Structure

```text
src/
├── App.tsx     # Main application entry point
├── config.ts   # Fusion Framework and CouchDB setup
├── index.ts    # App bootstrap
├── components/
│   ├── ProfileManager/   # Profile management
│   ├── SyncStatus/       # Replication status and logs
│   └── Todo/             # Todo list
└── modules/
    └── app-state-with-replication/
        ├── configurator.ts         # Allow configuration of local and remote db
        ├── provider.ts             # Override base provider to setup sync
        ├── module.ts               # Override setup of configurator and provider
        └── observe-sync.ts         # Helper to listen and aggregate sync events
```

## 🧪 Examples in This Cookbook

### 1. Profile Manager

Demonstrates basic state management with CouchDB replication:

- **User profile data** - name, email, preferences
- **Reducer pattern** - manage complex state transitions
- **Real-time updates** - changes sync across browser tabs
- **Optimistic updates** - UI responds immediately
- **Conflict resolution** - last-write-wins strategy

### 2. Sync Status Monitor

Provides real-time monitoring of replication status:

- **Connection status** - online, offline, syncing, error
- **Sync events log** - detailed replication activity
- **Manual sync trigger** - force sync when needed
- **Error handling** - graceful degradation on failures

**Visual Indicators:**
- 🟢 Online - Connected and synced
- 🔵 Syncing - Data transfer in progress
- 🔴 Offline/Error - Connection issues

### 3. Todo List

Complex state management with real-world patterns:

- **CRUD operations** - create, read, update, delete todos
- **Optimistic updates** - instant UI feedback
- **Conflict resolution** - handles concurrent edits
- **Data relationships** - nested object structures

## 📦 Module - App State With Replication

The `app-state-with-replication` module encapsulates the logic for integrating CouchDB replication into the Fusion Framework state system. Here’s a summary of its key components and how they work together:

- **`configurator.ts`**  
  Provides a configurator for setting up both local (PouchDB) and remote (CouchDB) databases. It allows you to specify database names, URLs, and sync options, making the module flexible for different environments.

- **`provider.ts`**  
  Extends the base state provider to initialize and manage replication. It sets up listeners for replication events (like sync, error, paused, active) and exposes sync status to the app, enabling UI components to react to connectivity and conflict states.

- **`module.ts`**  
  Registers the custom configurator and provider with the Fusion Framework. This ensures that when the module is enabled, your app state is automatically wired for replication and sync monitoring.

- **`observe-sync.ts`**  
  Implements utilities to observe and aggregate sync events from PouchDB. It provides hooks and helpers to track replication status, errors, and progress, which can be used to display real-time sync indicators in your UI.

- **`types.ts`**  
  Defines TypeScript types for configuration, sync status, and events. This ensures type safety and clarity when working with the module’s APIs.

- **`enable-module.ts`**  
  Exposes a helper to easily enable the module in your Fusion Framework app, streamlining integration.

- **`index.ts`**  
  Entry point that exports the module’s public API, including hooks and configuration helpers.

**Key Takeaways:**
- The module abstracts away the complexity of CouchDB/PouchDB replication, exposing a simple API for state management with robust sync.
- Sync status and events are observable, allowing you to build responsive UIs that reflect real-time connectivity and conflict resolution.
- Configuration is centralized and type-safe, making it easy to adapt for different deployment scenarios (dev, prod, per-user DBs, etc.).
- The modular design means you can swap out or extend replication logic as your app’s needs evolve.

Refer to the [source files](src/modules/app-state-with-replication/) for implementation details and customization options.

## 🔧 Advanced Configuration

### Custom Sync Options

Fine-tune replication behavior:

```typescript
const syncOptions = {
  live: true,              // Enable continuous replication
  retry: true,             // Retry on connection failure
  heartbeat: 10000,        // Heartbeat interval (ms)
  timeout: 30000,          // Request timeout (ms)
  batch_size: 100,         // Batch size for bulk operations
  batches_limit: 10,       // Maximum parallel batches
  filter: 'app/by_user',   // Filter specific documents
  since: 'now',            // Start replication from now
};
```

### Security Configuration

For production environments:

```typescript
// Enable SSL/TLS for production
const remoteDb = PouchDbStorage.CreateDb(remoteDbUrl, {
  fetch: (url, opts) => {
    return fetch(url, {
      ...opts,
      headers: {
        ...opts.headers,
        'Authorization': 'Bearer ' + authModule.getToken(),
      },
    });
  },
});
```

### Database Per User
#### Per-User Database Routing Example

To route requests to a remote CouchDB instance and automatically prefix the database or document path with the current user's username, you can use an Express route as a proxy. This approach ensures each user's data is isolated in their own database or document namespace.

Example Express proxy route:

```typescript
const httpProxy = require('http-proxy');
const url = require('url');

// Create proxy server
const proxy = httpProxy.createProxyServer({
    target: 'http://couch-db-remote:5984',
    changeOrigin: true
});

// Handle proxy path rewriting
proxy.on('proxyReq', (proxyReq, req, res) => {
    const parsedUrl = url.parse(req.url);
    const dbName = parsedUrl.pathname.split('/').pop();
    const userId = 'user123'; // Simulated user ID
    const newPath = `/${userId}_${dbName}${parsedUrl.search || ''}`;
    proxyReq.path = newPath;
});
```
**Usage:**  
Mount this proxy route in your Express app.  
When you POST to `/proxy-to-remote/:dbName`, the route automatically prefixes the CouchDB database path with the current user's username, isolating each user's data.  
Example:  
A POST to `/proxy-to-remote/todos` for user `alice` will proxy to `/alice_todos` on CouchDB.

### Common Issues

1. **CouchDB Connection Refused**
   ```bash
   # Check if CouchDB is running
   curl http://localhost:5984/
   
   # Restart CouchDB
   pnpm couchdb:down && pnpm couchdb:up
   ```

2. **CORS Errors**
   - Check browser developer tools for detailed error messages

3. **Authentication Errors**
   - Verify credentials: `admin` / `admin`
   - Check CouchDB admin interface: http://localhost:5984/_utils

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

### 2. Use strong typing

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
  const setUser = useCallback((user: UserProfile) => {
    if (userSchema.safeParse(user).success) {
      setValue(user);
      return true;
    } else {
      console.warn('Provided user is invalid');
      return false;
    }
  }, [setValue]);
  if(!userSchema.safeParse(value).success) {
    console.warn('Current user state is invalid');
    return null;
  }
  return value;
};

const [user, setUser] = useMyUser();

// ❌ Avoid - no validation
const [user, setUser] = useAppState<UserProfile>();
console.log(value.name);
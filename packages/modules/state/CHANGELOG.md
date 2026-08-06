# @equinor/fusion-framework-module-state

## 1.0.0

### Major Changes

- b92698d: **🚀 Introducing the Fusion Framework State Module**

  **@equinor/fusion-framework-module-state** is a new reactive state management module with built-in synchronization capabilities and comprehensive event system for enterprise-grade applications.

  **🗄️ Synchronization Features**
  - **PouchDbSyncStorage**: Bidirectional synchronization with remote databases
  - **Real-time sync events**: Monitor sync progress, errors, and status changes
  - **Conflict resolution**: Automatic handling of concurrent data modifications
  - **Live sync options**: Configurable heartbeat, retry, and timeout settings

  **📡 Event System**
  Comprehensive event architecture for type-safe state management:

  **Event Classes:**
  - `StateEntryCreatedEvent` - Item creation tracking
  - `StateEntryUpdatedEvent` - Item modification events
  - `StateEntryDeletedEvent` - Item removal notifications
  - `StateSyncChangeEvent` - Sync data changes
  - `StateSyncCompleteEvent` - Sync operation completion
  - `StateSyncErrorEvent` - Sync failure handling
  - `StateSyncStatusEvent` - Sync status monitoring
  - `StateOperationSuccessEvent` - Successful operations
  - `StateOperationFailureEvent` - Operation failure tracking

  **Event Organization:**
  - `StateChangeEvent` - CRUD operation events
  - `StateSyncEvent` - Synchronization events
  - `StateOperationEvent` - Operation result events

  **🏗️ Core Architecture**
  - **StateProvider**: Reactive state management with observable patterns
  - **Storage Interface**: Extensible storage backends with sync capabilities
  - **Type Safety**: Comprehensive TypeScript definitions
  - **Memory Management**: Proper cleanup and disposal patterns
  - Storage and sync events are dispatched through the app's `event` module, so `onStateSync.*`
    listeners registered via `useAppModule('event').addEventListener(...)` actually fire.

### Patch Changes

- 0d6ef3a: Internal: bump `happy-dom` from `18.0.1` to `20.8.9` (dev dependency, test environment only). Resolves Dependabot security alerts for Happy DOM VM context escape / RCE, ECMAScriptModuleCompiler code injection, and fetch cross-origin cookie disclosure.
- 020d9e5: Internal: bump `uuid` from `^11.1.1` to `^14.0.1`, matching the version already used across the rest of the monorepo. Not directly imported by this package's source, so no breaking impact.
- 0d9d876: Internal: bump `uuid` from `^11.0.3` to `^11.1.1`. Resolves Dependabot security alert for a missing buffer bounds check in `uuid` v3/v5/v6 when a buffer is provided (`< 11.1.1`).
- 05586e7: Internal: bump `vitest` from `^2.0.5` to `^4.1.0` (dev dependency, test runner only), matching the version already used across the rest of the monorepo. Resolves Dependabot security alerts for the Vitest UI server arbitrary file read/execute vulnerability (`< 3.2.6`).

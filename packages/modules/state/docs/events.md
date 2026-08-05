# State Events

Event types, listening patterns, and payload reference for state changes, sync, and operation
outcomes dispatched by `@equinor/fusion-framework-module-state`.

## Prerequisite: the event module

State events are dispatched through `@equinor/fusion-framework-module-event`, an optional peer
dependency. If the `event` module isn't registered, `StateProvider` still works — it just skips
dispatching events, since nothing subscribes to them.

```typescript
import { createModuleConfigurator } from '@equinor/fusion-framework-module';
import { enableEventModule } from '@equinor/fusion-framework-module-event';
import { enableStateModule } from '@equinor/fusion-framework-module-state';

const configurator = createModuleConfigurator();

enableEventModule(configurator);
enableStateModule(configurator);

const modules = await configurator.initialize();

modules.event.addEventListener('onState.created', (event) => {
  console.log('Entry created:', event.key, event.item);
});
```

Import the event classes from the `/events` subpath:

```typescript
import { StateChangeEvent, StateSyncEvent, StateOperationEvent, StateErrorEvent } from '@equinor/fusion-framework-module-state/events';
```

## State change events

Dispatched whenever an item is stored, updated, or removed.

| Event | Type string | Payload |
| --- | --- | --- |
| `StateEntryCreatedEvent` | `onState.created` | `key`, `item`, optional `_id` |
| `StateEntryUpdatedEvent` | `onState.updated` | `key`, optional `item`/`_id` |
| `StateEntryDeletedEvent` | `onState.deleted` | `key`, optional `item`/`_id` |

```typescript
modules.event.addEventListener('onState.updated', (event) => {
  console.log('Updated:', event.key, event.item?.value);
});
```

Use the `StateChangeEvent` grouping when you want to handle any of the three with a single
type guard:

```typescript
import { StateChangeEvent } from '@equinor/fusion-framework-module-state/events';

modules.event.event$.subscribe((event) => {
  if (StateChangeEvent.is(event)) {
    console.log('State changed:', event.type, event.key);
  }
});
```

## Sync events

Dispatched by storage implementations that support replication (e.g. `PouchDbSyncStorage`) while
a sync session is active.

| Event | Type string | Payload |
| --- | --- | --- |
| `StateSyncChangeEvent` | `onStateSync.change` | `direction` (`'push' \| 'pull'`), `change`, optional `id` |
| `StateSyncCompleteEvent` | `onStateSync.complete` | `result` (`{ push?, pull? }`), optional `id` |
| `StateSyncErrorEvent` | `onStateSync.error` | `error`, `type` (`'error' \| 'denied'`), optional `id` |
| `StateSyncStatusEvent` | `onStateSync.status` | `status`, optional `id` |

```typescript
modules.event.addEventListener('onStateSync.error', (event) => {
  console.error('Sync failed:', event.type, event.error);
});

modules.event.addEventListener('onStateSync.status', (event) => {
  console.log('Sync status:', event.status);
});
```

Use `StateSyncEvent.is(event)` to match any of the four sync events at once, e.g. for a single
telemetry hook that logs all sync activity.

## Operation events

Dispatched around individual `StateProvider` method calls, useful for timing and diagnostics.

| Event | Type string | Payload |
| --- | --- | --- |
| `StateOperationSuccessEvent` | `onStateOperation.success` | `fn`, optional `message`, `args`, `result`, `metric` |
| `StateOperationFailureEvent` | `onStateOperation.failure` | `fn`, `args?`, `metric?`, `error` |

```typescript
modules.event.addEventListener('onStateOperation.failure', (event) => {
  console.error(`${event.fn} failed:`, event.error);
});
```

Use `StateOperationEvent.is(event)` to match either outcome.

## Storage error events

`StateErrorEvent` (`onState.error`) is dispatched when a storage operation fails outside the
success/failure pair above — e.g. a malformed key or a rejected write. It carries `key` (when
known) and `error` (a `StorageError`).

```typescript
import { StateErrorEvent } from '@equinor/fusion-framework-module-state/events';

modules.event.addEventListener('onState.error', (event) => {
  console.error('Storage error:', event.key, event.error);
});
```

## Type guards

Every event class exposes a static `is()` guard that accepts both real instances and
structurally-compatible values (useful when events cross a serialization boundary):

```typescript
import { StateEntryCreatedEvent } from '@equinor/fusion-framework-module-state/events';

modules.event.event$.subscribe((event) => {
  if (StateEntryCreatedEvent.is(event)) {
    console.log('Created:', event.key);
  }
});
```

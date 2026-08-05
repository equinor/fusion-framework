---
"@equinor/fusion-framework-react-app": minor
---

Add `useStateSyncEvents` hook to `@equinor/fusion-framework-react-app/state`. It subscribes to
the app's `onStateSync.status`/`.change`/`.complete`/`.error` events (dispatched by the `state`
module when its storage is configured for replication, e.g. `PouchDbSyncStorage`) and returns the
most recent events, oldest first, bounded to a given `limit`:

```typescript
import { useStateSyncEvents } from '@equinor/fusion-framework-react-app/state';

const events = useStateSyncEvents(20);
const lastEvent = events.at(-1);
```

This replaces the need for consumers to manually register four separate `addEventListener` calls
on the `event` module and aggregate them by hand to build sync-status UI.

Also re-exports `StateSyncEvent` and `StateSyncEventType` from `@equinor/fusion-framework-module-state`
for convenience.

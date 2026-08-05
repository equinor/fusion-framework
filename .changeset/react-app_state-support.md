---
"@equinor/fusion-framework-react-app": minor
---

Add state management support to `@equinor/fusion-framework-react-app/state`:

- `enableAppState` - configures the app to use `@equinor/fusion-framework-module-state`, with
  app-scoped storage key prefixing to prevent state collisions between apps.
- `useAppState` - a persistent, cross-component-synchronized alternative to `useState`, backed by
  the state module's storage.
- `useStateSyncEvents` - subscribes to the app's `onStateSync.status`/`.change`/`.complete`/`.error`
  events (dispatched when storage is configured for replication, e.g. `PouchDbSyncStorage`) and
  returns the most recent events, oldest first, bounded to a given `limit`. Also re-exports
  `StateSyncEvent` and `StateSyncEventType` from `@equinor/fusion-framework-module-state` for
  convenience.

```typescript
import { enableAppState } from '@equinor/fusion-framework-react-app/state';

export const configure = (configurator) => {
  enableAppState(configurator);
};
```

```typescript
import { useAppState, useStateSyncEvents } from '@equinor/fusion-framework-react-app/state';

const [count, setCount] = useAppState('counter', { defaultValue: 0 });
const events = useStateSyncEvents(20);
```

Requires the optional peer dependency `@equinor/fusion-framework-module-state`.

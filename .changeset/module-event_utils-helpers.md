---
"@equinor/fusion-framework-module-event": minor
---

Add `waitForEvent` and `watchEvents` helper utilities and `./operators` subpath.

**New subpath exports:**

```ts
import { filterEvent } from '@equinor/fusion-framework-module-event/operators';
import { waitForEvent, watchEvents } from '@equinor/fusion-framework-module-event/utils';
```

### `waitForEvent(provider, matcher, options?)`

Resolves with the next event matching `matcher`. Accepts a single event type string (uses the type-scoped `filterEvent` path and preserves type narrowing), an array of type strings, or a predicate function. Supports an optional `timeout` (ms) and `AbortSignal` so a test cannot hang indefinitely.

```ts
// Single type — typed result
const event = await waitForEvent(provider, 'onModulesLoaded');

// Array of types
const event = await waitForEvent(provider, ['myFeature.saved', 'myFeature.updated']);

// Predicate matching on payload
const event = await waitForEvent(provider, (e) => e.detail?.id === 1);

// With timeout
const event = await waitForEvent(provider, 'myFeature.saved', { timeout: 1000 });
```

### `watchEvents(provider, matcher)`

Collects all events matching `matcher` into an array. Only matching events are ever stored — a high volume of non-matching dispatches does not cause unbounded memory growth. Returns a handle with `events`, `lastEvent(type?)`, and `dispose()`.

```ts
const handle = watchEvents(provider, ['myFeature.saved', 'myFeature.deleted']);
// ... run code under test ...
expect(handle.lastEvent('myFeature.saved')?.detail).toEqual({ id: 1 });
handle.dispose();
```

### `./operators` subpath

`filterEvent` is now also exported from `@equinor/fusion-framework-module-event/operators`. The existing root export is preserved — no migration required for current consumers.

Resolves [equinor/fusion-core-tasks#1656](https://github.com/equinor/fusion-core-tasks/issues/1656).

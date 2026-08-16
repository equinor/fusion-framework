# Testing

`@equinor/fusion-framework-module-event/utils` provides standalone helper functions for waiting on and collecting dispatched events, so tests (and application code) don't need to hand-roll `event$` subscriptions.

These are plain functions, not test doubles — they work identically against any real `IEventModuleProvider`, whether that provider comes from a mocked host Fusion (app or portal test), or a hand-rolled `ModulesConfigurator` in a 3rd-party bespoke integration. No mock, no test-runner dependency, and no consumer-specific code path.

```ts
import { waitForEvent, watchEvents } from '@equinor/fusion-framework-module-event/utils';
```

## `waitForEvent`

Resolves with the next event matching `matcher`, built on `provider.event$`.

```ts
// Single registered type — resolves with the typed FrameworkEventMap entry
const event = await waitForEvent(modules.event, 'myFeature.saved');
expect(event.detail).toEqual({ id: 1 });
```

`matcher` also accepts an array of type strings, or a predicate that filters on the event payload instead of just its type:

```ts
// Array of types — resolves on whichever fires first
const event = await waitForEvent(modules.event, ['myFeature.saved', 'myFeature.updated']);

// Predicate — matches on payload, not just type
const event = await waitForEvent(
  modules.event,
  (e) => e.type === 'myFeature.saved' && e.detail.id === 1,
);
```

`string`/`string[]` matchers reuse the same type-scoped `filterEvent` path used by `event$.pipe(filterEvent(type))` elsewhere in the module. A bare predicate has no type to scope on, so it filters the raw `event$` stream directly.

### Timing out

Pass `timeout` (milliseconds) or an `AbortSignal` so a test fails fast instead of hanging when the expected event never fires:

```ts
// Rejects after 1000ms if the event never fires
const event = await waitForEvent(modules.event, 'myFeature.saved', { timeout: 1000 });

// Rejects immediately when the signal aborts
const controller = new AbortController();
const event = await waitForEvent(modules.event, 'myFeature.saved', { signal: controller.signal });
```

`waitForEvent` is one-shot: it resolves once and retains nothing beyond the single matched event.

## `watchEvents`

Collects every event matching `matcher`, for assertions across multiple occurrences or ordering. Only events that pass `matcher` are ever stored — a high volume of non-matching events dispatched elsewhere in the app does not grow memory. This is deliberate: there is no unscoped "record everything" mode.

```ts
const events = watchEvents(modules.event, ['myFeature.saved', 'myFeature.deleted']);

// ... run the code under test ...

expect(events.events).toHaveLength(2);
expect(events.lastEvent('myFeature.saved')?.detail).toEqual({ id: 1 });

// stop collecting once assertions are done
events.dispose();
```

`WatchEventsHandle` exposes:

- `events` — all matching events collected so far, in dispatch order
- `lastEvent(type?)` — the most recently collected event, optionally narrowed to a specific type
- `dispose()` — stops collecting; already-collected events remain accessible

## Using a bespoke `ModulesConfigurator`

Both helpers take an `IEventModuleProvider`, so they work the same way with a manually composed set of modules — no app or portal host required:

```ts
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import eventModule from '@equinor/fusion-framework-module-event';
import { waitForEvent } from '@equinor/fusion-framework-module-event/utils';

const instances = await new ModulesConfigurator([eventModule /* + other modules */]).initialize();
const event = await waitForEvent(instances.event, 'theirCustomEvent');
```

## Intercepting or canceling events

`waitForEvent` and `watchEvents` are for **observing** events that have already been dispatched — they cannot cancel or alter an event before its listeners run. To intercept events before dispatch (for example, to block one in a test), configure the module's `onDispatch` hook instead — see [Configuration](configuration.md).

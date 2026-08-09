# Observable Patterns

## The `event$` stream

The `event$` observable emits every dispatched event. Subscribers receive events **after** dispatch and **cannot** call `preventDefault` or `stopPropagation` — use `addEventListener` for side-effect-capable handling.

```ts
import { filterEvent } from '@equinor/fusion-framework-module-event';

// Subscribe to all events
const sub = modules.event.event$.subscribe((event) => {
  console.log(event.type, event.detail);
});

// Or filter to a specific registered event type
const filtered = modules.event.event$.pipe(
  filterEvent('onModulesLoaded'),
).subscribe((event) => {
  // event is narrowed to the registered type
  console.log(event.detail);
});

// Unsubscribe on teardown
sub.unsubscribe();
filtered.unsubscribe();
```

## The `./operators` subpath

`filterEvent` is also exported from `@equinor/fusion-framework-module-event/operators`, alongside any future RxJS pipeable operators for the event module. The root-level export shown above is preserved for backward compatibility, so either import path works:

```ts
import { filterEvent } from '@equinor/fusion-framework-module-event/operators';
```

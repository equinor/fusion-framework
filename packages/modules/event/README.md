# @equinor/fusion-framework-module-event

Async event dispatching module for the Fusion Framework. Enables type-safe communication between framework modules (siblings) and across parent/child instances through an event system modeled after the native DOM `EventTarget`, but with **async dispatch** so cancelable events can be properly awaited.

> **Important:** When dispatching a `cancelable` event you **must** `await` the `dispatchEvent` call. Firing without `await` means `preventDefault()` calls from listeners will not be respected.

## Who should use this

- **Module authors** that need to emit lifecycle or domain events other modules can react to.
- **Application developers** that want to intercept, log, or cancel events flowing through the framework.
- **Library consumers** that subscribe to event streams for analytics, debugging, or cross-cutting concerns.

## Quick start

### Install

```sh
pnpm add @equinor/fusion-framework-module-event
```

The event module is included by default when initializing the Fusion Framework, so explicit installation is only needed when using it standalone.

### Listen to an event

```ts
const teardown = modules.event.addEventListener('onModulesLoaded', (event) => {
  console.log('All modules loaded:', event.detail);
});

// remove the listener when no longer needed
teardown();
```

### Dispatch an event

```ts
const event = await modules.event.dispatchEvent('myEvent', {
  detail: { id: 42 },
  cancelable: true,
});

if (!event.canceled) {
  performAction();
}
```

## API overview

| Export | Kind | Purpose |
|---|---|---|
| `FrameworkEvent` | Class | Base event carrying `detail`, `source`, cancel/bubble flags |
| `FrameworkEventInit` | Type | Options passed when constructing an event |
| `FrameworkEventMap` | Interface | Extensible registry mapping event names → event types |
| `FrameworkEventHandler` | Type | Listener callback signature (sync or async) |
| `IEventModuleProvider` | Interface | Public API for the event provider (`addEventListener`, `dispatchEvent`, `event$`) |
| `EventModuleProvider` | Class | Default provider implementation |
| `IEventModuleConfigurator` | Interface | Configuration hooks (`onDispatch`, `onBubble`) |
| `filterEvent` | Function | RxJS operator to narrow `event$` to a single registered event type |
| `EventModule` / `eventModuleKey` | Type / Const | Module definition and key (`'event'`) |

## Configuration

Configure the event module during framework setup to hook into dispatch lifecycle:

```ts
import type { FrameworkEvent } from '@equinor/fusion-framework-module-event';

const configurator = (config) => {
  // Inspect or cancel events before listeners run
  config.event.onDispatch = (event: FrameworkEvent) => {
    if (!isAllowed(event)) {
      event.preventDefault();
    }
  };

  // Disable bubbling to parent providers
  delete config.event.onBubble;
};
```

### `onDispatch`

Called **before** registered listeners. Use it to log, validate, or cancel events globally.

### `onBubble`

Called **after** all listeners if the event still bubbles. By default, the framework wires this to forward events to the parent provider. Delete it to isolate events to the current scope.

## Registering custom event types

Extend `FrameworkEventMap` via TypeScript declaration merging to get type-safe `addEventListener` and `dispatchEvent` calls:

```ts
import type {
  FrameworkEvent,
  FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

interface MyPayload {
  id: string;
  value: number;
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'myFeature': FrameworkEvent<FrameworkEventInit<MyPayload>>;
  }
}
```

After registration, both the event name and payload are type-checked:

```ts
modules.event.addEventListener('myFeature', (event) => {
  // event.detail is typed as MyPayload
  console.log(event.detail.id);
});
```

## Observable event stream

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

## Event lifecycle

1. `dispatchEvent` is called with a name + init or a `FrameworkEvent` instance.
2. The `onDispatch` hook runs (if configured). Canceling here stops all listeners.
3. Registered listeners execute sequentially. For cancelable events each listener is `await`ed; non-cancelable listeners fire without awaiting.
4. If the event still bubbles, the `onBubble` hook runs (typically forwarding to a parent provider).
5. The event is pushed to `event$` for observable subscribers.

## Cancelable events

Mark an event as `cancelable` in its init and `await` dispatch:

```ts
const event = await modules.event.dispatchEvent('myEvent', {
  detail: data,
  cancelable: true,
});

if (event.canceled) {
  // A listener called event.preventDefault()
  return;
}
```

A listener cancels the event by calling `preventDefault()`:

```ts
modules.event.addEventListener('myEvent', (event) => {
  if (shouldBlock(event.detail)) {
    event.preventDefault();
  }
});
```

## Bubbling

Events bubble to parent providers by default (`canBubble: true`). A listener can stop propagation:

```ts
modules.event.addEventListener('myEvent', (event) => {
  event.stopPropagation(); // prevents bubbling to parent
});
```

Or disable bubbling for a specific event at dispatch time:

```ts
await modules.event.dispatchEvent('myEvent', {
  detail: data,
  canBubble: false,
});
```
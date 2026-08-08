# Configuration

## Dispatch hooks

The event module is configured through `EventModuleConfigurator`, a `BaseConfigBuilder` with
fluent `setOnDispatch`/`setOnBubble` setters:

```ts
import { EventModuleConfigurator } from '@equinor/fusion-framework-module-event';

const doNotHandleEvents = ['onMyEvent'];
const doNotPropagateEvents = ['myOtherEvent'];

const configurator = new EventModuleConfigurator();

// Inspect or cancel events before listeners run
configurator.setOnDispatch((event) => {
  if (doNotHandleEvents.includes(event.type)) {
    event.preventDefault();
  }
  if (doNotPropagateEvents.includes(event.type)) {
    event.stopPropagation();
  }
});

// Disable bubbling to parent providers
configurator.setOnBubble(undefined);
```

> **Deprecated:** assigning `configurator.onDispatch`/`configurator.onBubble` directly still
> works but is deprecated since `6.1.0` — use `setOnDispatch`/`setOnBubble` instead.

### `onDispatch`

Called **before** registered listeners. Use it to log, validate, or cancel events globally.

### `onBubble`

Called **after** all listeners if the event still bubbles. By default, the framework wires this to forward events to the parent provider. Pass `undefined` to isolate events to the current scope.

## Registering custom event types

Extend `FrameworkEventMap` via TypeScript declaration merging to get type-safe `addEventListener` and `dispatchEvent` calls. Declaring the map entry adds type hinting only — it does not add any runtime behavior:

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

## Custom event classes

For behavior beyond a typed `detail`, subclass `FrameworkEvent` directly:

```ts
class MyEvent extends FrameworkEvent<MyPayload, MySource> {
  constructor(readonly obj: MyObj, init: FrameworkEventInit<MyPayload, MySource>) {
    super('onMyEvent', init);
  }
}

// add type hinting
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onMyEvent: MyEvent;
  }
}

modules.event.dispatchEvent(new MyEvent(someObj, { detail, source }));

modules.event.addEventListener('onMyEvent', (event) => {
  console.log('is my custom event:', event instanceof MyEvent);
  console.log('my custom obj', event.obj);
});
```


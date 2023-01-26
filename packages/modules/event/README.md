# @equinor/fusion-framework-module-event

This package is meant for dispatching events between modules (siblings) and cross instances (parent|adjunct)

> Base on the native node/web js event system, __but__ the dispatcher is `async` for easier handling of `cancelable` events.
>
> __NOTE__ that creating a `cancelable` event without awaiting resolution, will not respect the `preventDefault` behavior!

## Configuration

```ts
const configurator = (config) => {
  /** disable propagation of all events */
  delete config.event.onBubble

  /** pre-handle all events before dispatch */
  config.event.onDispatch = (e: FrameworkEvent) => {
    if(!allow_event(e)){
      e.preventDefault();
    }
  } 
}
```

### Declaring events
```ts
import { ModuleEvent } from '@equinor/fusion-framework-module-event';
/** declare event type for code completion */
declare module '@equinor/fusion-framework-module-event' {
    interface ModuleEventMap {
        'someEvent': FrameworkEvent<FrameworkEventInit<MyDataObject, MySource>>;
    }
}
```

### Custom events
```ts
import { ModuleEvent } from '@equinor/fusion-framework-module-event';

type CustomFrameworkEventInit = FrameworkEventInit<MyDataObject, MySource>;

class MyCustomEvent extends FrameworkEvent<CustomFrameworkEventInit, 'myCustomEvent'> {
  constructor(init: CustomFrameworkEventInit) { /** logic */ }
}

/** declare event type for code completion */
declare module '@equinor/fusion-framework-module-event' {
    interface ModuleEventMap {
        'myCustomEvent': MyCustomEvent;
    }
}
```

## Usage

### Handle a single event type
```ts
const teardown = modules.event.addEventListener('someEvent', (event) => console.log(event));
// remove event listener
teardown();
```

### Dispatch event
```ts
// simple
const event = await modules.event.dispatchEvent(
  'myEvent', 
  {
    detail: 'some detail', 
    canBubble: false, 
    cancelable: true
    }
);

// alternative
const event = new MyCustomFrameworkEvent(
  'myCustomEvent', 
  {
    detail: 'some detail', 
    canBubble: false, 
    cancelable: true
    }
);
await modules.event.dispatchEvent(myEvent);


if(!event.defaultPrevent){
  doSomeAction();
}
```

### Subscribe to all events
> note that when subscribing to events, it does not allow side-effects, like `preventDefault` and `stopPropagation`
```ts
const subscription = modules.event.subscribe(console.log);
subscription.add(
  modules.event.subscribe({
    next: (event) => console.log(event),
    error: (err) => console.error(err),
    complete: () => 'event provider disposed'
  })
);
// when unmount
subscription.unsubscribe();
```
---
title: Event Module - React
category: Module
tag:
    - react
    - event
---

<ModuleBadge module="/react/modules/event" package="@equinor/fusion-framework-react-module-event"/>

```ts
import { useEventProvider } from '@equinor/fusion-framework-react-module-event';

/* fetch the `ÌEventModuleProvider` from the closes module provder */
const eventProvider = useEventProvider();
```

## EventProvider

if needed, the resolving of which `ÌEventModuleProvider` the `useEventProvider` will provide can be altered by using  
the `EventProvider` component

**example app:**
```tsx
import { EventProvider, EventConsumer } = from '@equinor/fusion-framework-react-module-event';
import { useFramework } = from '@equinor/fusion-framework-react-app/framework';
const Content = () => {
  const framework = useFramework().modules.event;
  return (
    <EventProvider value={framework.modules.event}>
      <EventLogger />
      <InlineEventConsumer />
    <EventProvider>
  );
};
```
```tsx
import { useEventHandler } = from '@equinor/fusion-framework-react-module-event';

const eventHandler = (event: FrameworkEventMap['some_event']) => {
  console.log(event.detail);
}; 

const EventLogger = () => useEventHandler('some_event', eventHandler);
```

```tsx
import { EventConsumer } = from '@equinor/fusion-framework-react-module-event';

const InlineEventConsumer = () => (
  <EventConsumer>
    { 
      (provider) => provider.dispatch(
        'some_event'), 
        { detail: { foo: 'bar' } } 
    }
  </EventConsumer>
)
``````

## Hooks

### useEventProvider

use `IEventModuleProvider` from current context see [EventProvider](#EventProvider)
```ts
import { useEventProvider } from '@equinor/fusion-framework-react-module-event';
```

### useEventModuleProvider

use `IEventModuleProvider` from closes module provider

```ts
import { useEventModuleProvider } from '@equinor/fusion-framework-react-module-event';
```


### useEventHandler
```ts
import { useEventHandler } from '@equinor/fusion-framework-react-module-event';

useEventHandler(
  'onContextChange', 
  /** note that callback must be memorized */
  useCallback((e) => {
    console.log(e.detail);
  }, [deps]);
);
```

### useEventStream

```ts
import { useEventStream, EventStream } from '@equinor/fusion-framework-react-module-event';

/* simple usage */
const { value: someEvent } = useObservableState(useEventStream('some_event'));

/* observe stream of events */
const someEvent$ = useEventStream(
  'some_event',
  /* note that callback must be memorized */
  useCallback(
    /* note react.useCallback cannot resolve source input */
    (event$: EventStream<'some_event'>) => event$.pipe(
      /* only some events */
      filter(e => e.detail.foo === dep.foo),
      /* mutate data */
      map(e => e.detail)
    ), 
    [dep]
  )
);
/* use state of stream */
const { value: foo } = useObservableState(someEvent$);

```

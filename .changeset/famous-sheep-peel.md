---
'@equinor/fusion-framework-react-module-event': minor
---

Expose the `IEventModuleProvider`

Add functionality for controlling which event provider which is used within the event hooks 

- create context for controlling the `IEventModuleProvider`
- create a hook for using `IEventModuleProvider`, 
  - uses the `IEventModuleProvider` from the `EventProvider` context
  - _fallbacks to event module from current module context_
- update the `useEventHandler` to use `useEventProvider`
  - previously resolving `IEventModuleProvider` from module context
- create a hook `useEventModuleProvider` which resolves `IEventModuleProvider` from module context


example app:
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

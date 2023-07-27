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
import { EventProvider } = from '@equinor/fusion-framework-react-module-event';
import { useFramework } = from '@equinor/fusion-framework-react-app/framework';
const Content = () => {
  const framework = useFramework().modules.event;
  return (
    <EventProvider value={framework.modules.event}>
      <InnerContent>
    <EventProvider>
  );
};
```
```tsx
const InnerContent = () => {
  const eventProvider = useEventProvider();
  useEventHandler('some_event', useCallback((event) => {
    console.log('FRAMEWORK_EVENT', event.detail);
  }, [eventProvider]));

  const appEventProvider = useEventModuleProvider();
  useEventHandler('some_event', useCallback((event) => {
    console.log('APP_EVENT', event.detail);
  }, [appEventProvider]));
}
```

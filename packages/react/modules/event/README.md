# @equinor/fusion-framework-react-module-event

React integration for the Fusion event module. Provides hooks and components for subscribing to and dispatching framework events from React components.

**Import:**

```ts
import { useEventHandler, useEventStream, EventConsumer, EventProvider } from '@equinor/fusion-framework-react-module-event';
```

## Exports

| Export                   | Type      | Description                                                     |
| ------------------------ | --------- | --------------------------------------------------------------- |
| `useEventHandler`        | Hook      | Subscribe to a named framework event with a callback            |
| `useEventStream`         | Hook      | Get an RxJS observable stream for a named event                 |
| `useEventProvider`       | Hook      | Access the event module provider directly                       |
| `useModulesEventProvider` | Hook     | Access the event provider from the module scope                 |
| `EventConsumer`          | Component | React context consumer for the event provider                   |
| `EventProvider`          | Component | React context provider for injecting an event provider          |

All types from `@equinor/fusion-framework-module-event` are also re-exported.

## useEventHandler

Subscribe to a framework event by name. The callback is registered on mount and cleaned up on unmount.

**Signature:**

```ts
function useEventHandler(key: string, cb: FrameworkEventHandler): void;
```

**Example:**

```tsx
import { useCallback } from 'react';
import { useEventHandler } from '@equinor/fusion-framework-react-module-event';

const ContextChangeListener = () => {
  useEventHandler(
    'onCurrentContextChanged',
    useCallback((event) => {
      console.log('Context changed:', event.detail);
    }, [])
  );

  return <div>Listening for context changes…</div>;
};
```

## useEventStream

Returns an RxJS observable stream filtered to a specific event. Useful when you need to compose event streams with RxJS operators.

**Signature:**

```ts
function useEventStream<TKey>(key: TKey, operator?: OperatorFunction): Observable;
```

> [!NOTE]
> The `operator` parameter must be memoised to avoid re-creating the stream on every render.

**Example:**

```tsx
import { useEventStream } from '@equinor/fusion-framework-react-module-event';
import { useObservableState } from '@equinor/fusion-observable/react';

const EventCounter = () => {
  const events$ = useEventStream('onCurrentContextChanged');
  const { value: lastEvent } = useObservableState(events$);

  return <p>Last event: {JSON.stringify(lastEvent?.detail)}</p>;
};
```

## Related

- [`@equinor/fusion-framework-module-event`](../../modules/event/README.md) — the underlying event module with full API documentation

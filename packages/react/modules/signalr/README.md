# @equinor/fusion-framework-react-module-signalr

React hooks for the Fusion SignalR module. Subscribe to real-time SignalR hub topics from React components with automatic connection management.

**Import:**

```ts
import { useTopic, enableSignalR } from '@equinor/fusion-framework-react-module-signalr';
```

## Exports

| Export                | Type     | Description                                               |
| --------------------- | -------- | --------------------------------------------------------- |
| `useTopic`            | Hook     | Subscribe to a SignalR topic using the closest module scope |
| `useProviderTopic`    | Hook     | Subscribe to a SignalR topic with an explicit provider      |
| `enableSignalR`       | Function | Enable the SignalR module in a configurator                |
| `Topic`               | Class    | A SignalR topic instance for pub/sub messaging             |
| `ISignalRConfigurator`| Type     | Configurator interface                                    |
| `SignalRHubConfig`    | Type     | Hub connection configuration                              |
| `SignalRModule`       | Type     | Module type definition                                    |

## useTopic

Subscribe to a SignalR hub topic. Returns a `Topic<T>` instance that exposes an observable message stream.

```tsx
import { useTopic } from '@equinor/fusion-framework-react-module-signalr';

type NotificationPayload = { message: string; severity: 'info' | 'warning' };

const Notifications = () => {
  const topic = useTopic<NotificationPayload>('notifications-hub', 'alerts');

  // topic.message$ is an Observable<NotificationPayload>
  // topic.send(payload) publishes to the hub

  return <div>Listening for alerts…</div>;
};
```

## useProviderTopic

Same as `useTopic`, but accepts an explicit `ISignalRProvider` instead of resolving from the module scope. Use this in libraries or when multiple providers are available.

```ts
import { useProviderTopic } from '@equinor/fusion-framework-react-module-signalr';

const topic = useProviderTopic<MyPayload>(provider, 'hub-id', 'topic-id');
```

## Related

- [`@equinor/fusion-framework-module-signalr`](../../../modules/signalr/README.md) — the underlying SignalR module

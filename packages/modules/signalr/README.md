# @equinor/fusion-framework-module-signalr

Fusion Framework module for real-time communication via [SignalR](https://learn.microsoft.com/aspnet/core/signalr/introduction).

Provides an RxJS-based API for connecting to SignalR hubs, subscribing to server-side methods, and sending messages back to the server. Hub connections are reference-counted and automatically stopped when all subscribers unsubscribe.

## When to use

Use this module when your Fusion application needs to:

- Receive real-time push notifications from a backend service
- Subscribe to server-sent events through a SignalR hub
- Send messages to a SignalR hub method

## Installation

```sh
pnpm add @equinor/fusion-framework-module-signalr
```

### Peer dependencies

| Package | Required |
| --- | --- |
| `@equinor/fusion-framework-module` | Yes |
| `@equinor/fusion-framework-module-msal` | No (needed for automatic token acquisition) |
| `@equinor/fusion-framework-module-service-discovery` | No (needed for service-discovery shorthand) |

## Quick start

### Service-discovery shorthand

The simplest path uses `enableSignalR` with service-discovery and MSAL. The hub URL and access token are resolved automatically:

```ts
import { enableSignalR } from '@equinor/fusion-framework-module-signalr';

export const configure = (configurator) => {
  enableSignalR(configurator, 'portal', {
    service: 'portal',
    path: '/signalr/hubs/service-message',
  });
};
```

### Custom configuration callback

For full control, pass a builder callback:

```ts
import { enableSignalR } from '@equinor/fusion-framework-module-signalr';

export const configure = (configurator) => {
  enableSignalR(configurator, 'custom', (builder) => {
    builder.addHub('custom', {
      url: 'https://my-service.example.com/hub',
      options: {
        accessTokenFactory: () => getAccessToken(),
      },
      automaticReconnect: true,
    });
  });
};
```

## Subscribing to hub messages

Once the module is initialized, use `ISignalRProvider.connect()` to obtain a `Topic` — an RxJS `Observable` bound to a specific hub method:

```ts
const signalR = modules.signalR;
const topic = signalR.connect<MyMessage>('portal', 'OnServiceMessage');

const subscription = topic.subscribe((message) => {
  console.log('Received:', message);
});

// Unsubscribe when done — the hub connection is stopped automatically
// when the last subscriber unsubscribes.
subscription.unsubscribe();
```

## Sending messages

A `Topic` also exposes `send()` (fire-and-forget) and `invoke()` (request-response) for communicating with the server:

```ts
// Fire-and-forget
topic.send('Hello from client');

// Request-response
const result = await topic.invoke<ServerResponse>('some argument');
```

## Key concepts

### Hub configuration (`SignalRHubConfig`)

Each hub connection is described by a `SignalRHubConfig`:

| Property | Type | Description |
| --- | --- | --- |
| `url` | `string` | Absolute URL of the SignalR hub endpoint |
| `options` | `IHttpConnectionOptions` | Transport and auth options (minus `httpClient`) |
| `automaticReconnect` | `boolean` | Enable automatic reconnection on disconnect |
| `logLevel` | `LogLevel` | SignalR logging level (defaults to `Critical`) |

### Connection lifecycle

- **Lazy creation** — hub connections are created on first subscription.
- **Shared connections** — multiple `Topic` instances for the same hub share one underlying `HubConnection` via `shareReplay`.
- **Automatic teardown** — when the last subscriber unsubscribes, the connection is stopped and removed from the internal cache.

### `Topic<T>`

`Topic` extends RxJS `Observable<T>` and wraps a `HubConnection` method listener. It handles registering and unregistering the callback on the connection automatically.

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `enableSignalR` | function | Register the module and configure hubs in one call |
| `module` / `default` | `SignalRModule` | Module instance for manual registration |
| `moduleKey` | `'signalR'` | Module registration key |
| `SignalRModuleProvider` | class | Default `ISignalRProvider` implementation |
| `SignalRConfigurator` | class | Default `ISignalRConfigurator` implementation |
| `SignalRModuleConfigBuilder` | class | Builder for dynamic hub configuration |
| `Topic` | class | RxJS Observable wrapper for a hub method |
| `ISignalRProvider` | interface | Provider interface |
| `ISignalRConfigurator` | interface | Configurator interface |
| `SignalRConfig` | type | Resolved configuration |
| `SignalRHubConfig` | type | Single hub configuration |
| `SignalRModuleConfigBuilderCallback` | type | Builder callback signature |

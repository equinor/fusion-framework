# @equinor/fusion-framework-module-event

Async event dispatching module for the Fusion Framework. Enables type-safe communication between framework modules (siblings) and across parent/child instances through an event system modeled after the native DOM `EventTarget`, but with **async dispatch** so cancelable events can be properly awaited.

> **Important:** When dispatching a `cancelable` event you **must** `await` the `dispatchEvent` call. Firing without `await` means `preventDefault()` calls from listeners will not be respected.

## Who should use this

- **Module authors** that need to emit lifecycle or domain events other modules can react to.
- **Application developers** that want to intercept, log, or cancel events flowing through the framework.
- **Library consumers** that subscribe to event streams for analytics, debugging, or cross-cutting concerns.

## Documentation

| Topic | Description |
|---|---|
| [Configuration](docs/configuration.md) | `onDispatch`/`onBubble` hooks and registering custom event types via `FrameworkEventMap` |
| [Observable Patterns](docs/observable-patterns.md) | `event$`, `filterEvent`, and the `./operators` subpath |
| [Lifecycle](docs/lifecycle.md) | Dispatch sequence, cancelable events, and bubbling |
| [Testing](docs/testing.md) | `waitForEvent`, `watchEvents`, and using a bespoke `ModulesConfigurator` in tests |

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
| `EventModuleConfig` | Type | Resolved configuration hooks (`onDispatch`, `onBubble`) |
| `EventModuleConfigurator` | Class | Fluent config builder (`setOnDispatch`, `setOnBubble`) — see [Configuration](docs/configuration.md) |
| `IEventModuleConfigurator` | Type | _Deprecated_ alias for `EventModuleConfig` |
| `filterEvent` | Function | RxJS operator to narrow `event$` to a single registered event type |
| `EventModule` / `eventModuleKey` | Type / Const | Module definition and key (`'event'`) |

### Subpaths

| Subpath | Exports | Purpose |
|---|---|---|
| `./operators` | `filterEvent` | RxJS pipeable operators over `event$` (also re-exported from the package root) |
| `./utils` | `waitForEvent`, `watchEvents` | Plain helpers for waiting on / collecting dispatched events, in application code or tests |

# @equinor/fusion-framework-module-navigation

Routing and navigation module for **Fusion Framework** with observable state management and automatic basename localization.

## Features

- **Path localization** — consumers work with clean paths (`/users`) while the history stack receives full paths (`/apps/my-app/users`).
- **Observable state** — navigation state exposed as an RxJS observable (`state$`) with `shareReplay` semantics.
- **Multiple history types** — browser (pathname), hash (`#/path`), and memory (no URL changes).
- **Router compatibility** — `createRouter()` creates `@remix-run/router` instances wired to the framework history.
- **Navigation blocking** — intercept navigations with `history.block()` and optionally retry.
- **Telemetry & events** — dispatches `NavigateEvent` / `NavigatedEvent` and tracks actions via the telemetry module.

## Installation

```sh
pnpm add @equinor/fusion-framework-module-navigation
```

## Usage

### Enable the module

```ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

// Minimal — basename only
enableNavigation(configurator, '/apps/my-app');

// Advanced — full configuration
enableNavigation(configurator, {
  configure: (config) => {
    config.setBasename('/apps/my-app');
    config.setHistory(createHistory('browser'));
  },
});
```

### Programmatic navigation

```ts
const navigation = framework.modules.navigation;

navigation.push('/users');             // adds history entry
navigation.replace('/login');          // replaces current entry
navigation.push('/users', { id: 1 }); // with state

console.log(navigation.path.pathname); // '/users' — basename removed
```

### Observable navigation state

```ts
import { filter } from 'rxjs';

navigation.state$.subscribe(({ action, location }) => {
  console.log(action, location.pathname); // 'PUSH' '/users'
});

navigation.state$.pipe(
  filter(({ action }) => action === 'POP'),
).subscribe(({ location }) => {
  console.log('Back/forward to', location.pathname);
});
```

### Create href / URL

```ts
// basename = '/apps/my-app'
navigation.createHref('/users');
// → '/apps/my-app/users'

navigation.createURL('/users');
// → URL { pathname: '/apps/my-app/users', ... }
```

### Router integration (legacy)

> **Note:** Prefer `@equinor/fusion-framework-react-router` for new applications.

```ts
import type { AgnosticRouteObject } from '@remix-run/router';

const routes: AgnosticRouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/users/:id', element: <UserDetail /> },
];

const router = navigation.createRouter(routes);
```

> Always use `navigation.createRouter()` instead of `createBrowserRouter()` directly—creating a router outside the provider breaks basename handling and state synchronisation.

### Initiator strategies (portal and widget)

The initiator of an app supplies a navigation strategy independently of route code:

```ts
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';

// Portal: the host owns the URL and history, and serves the app under `basename`.
enableNavigation(configurator, {
  initiator: { kind: 'host', history: hostHistory, basename: '/apps/my-app' },
});

// Widget: a new, isolated memory history per app instance.
enableNavigation(configurator, {
  initiator: { kind: 'memory', initialLocation: '/start', basename: '/widget' },
});
```

**Precedence:** explicit app configuration (`setBasename`, `setHistory` in `configure`) > initiator > standalone browser defaults.

- `host`: the navigation module wraps the host history and never disposes it. A compatible explicit `basename` (same after slash normalization) or the same history instance is kept. An explicit basename or a different history violates the required host constraint, so startup fails with a `NavigationInitiatorConflictError` that names both settings. Nothing is overridden silently.
- `memory`: a new `MemoryHistory` is created per module instance, owned by the module, and disposed with it. `window.location` is neither read nor modified. `initialLocation` is relative to `basename` (a location already inside `basename` is used as given) and defaults to the app root. Explicit configuration still wins over the memory strategy.
- The navigation module stays the only history owner; routers created with `createRouter` (and `Router` from `@equinor/fusion-framework-react-router`) consume it.

For apps use `enableAppNavigation` from `@equinor/fusion-framework-app/enable-navigation` (re-exported by `@equinor/fusion-framework-react-app/navigation`); for widgets use `enableWidgetNavigation` from `@equinor/fusion-framework-widget`. Neither requires `enableNavigation` or copying `env.basename`.

### History types

| Factory argument | Class | Description |
|---|---|---|
| `'browser'` | `BrowserHistory` | Pathname-based routing via the History API. **Default.** |
| `'hash'` | `BrowserHistory` (hash stack) | Hash-fragment routing (`#/path`). No server config needed. |
| `'memory'` | `MemoryHistory` | In-memory history. Ideal for widgets, tests, and SSR. |

```ts
import { createHistory } from '@equinor/fusion-framework-module-navigation';

const browserHistory = createHistory('browser');
const hashHistory    = createHistory('hash');
const memoryHistory  = createHistory('memory');
```

### Navigation blocking

```ts
const unblock = navigation.history.block((transition) => {
  if (hasUnsavedChanges) {
    showConfirmDialog(() => {
      unblock();          // remove blocker first
      transition.retry(); // then retry navigation
    });
  } else {
    unblock();
    transition.retry();
  }
});
```

## API Reference

### Functions

| Export | Description |
|---|---|
| `enableNavigation(configurator, opts?)` | Registers the navigation module on a configurator. |
| `createHistory(type, ...args)` | Factory for `BrowserHistory`, hash-based `BrowserHistory`, or `MemoryHistory`. |

### Classes

| Export | Description |
|---|---|
| `NavigationProvider` | Module provider — manages state, localization, and lifecycle. |
| `NavigationConfigurator` | Fluent config builder with Zod validation. |
| `BrowserHistory` | History backed by browser `pushState` / `replaceState`. |
| `MemoryHistory` | History backed by in-memory storage. |

### Interfaces & Types

| Export | Description |
|---|---|
| `INavigationProvider` | Public contract for the navigation provider. |
| `INavigationConfigurator` | Configuration shape (`basename`, `history`, `telemetry`, `eventProvider`). |
| `History` | History instance contract (observable state + navigation methods). |
| `Path` | `{ pathname, search, hash }` |
| `Location` | `Path` extended with `state` and `key`. |
| `To` | `string \| Partial<Path>` — target for navigation operations. |
| `Action` | Enum: `Pop`, `Push`, `Replace`. |
| `NavigationUpdate` | `{ delta, action, location }` emitted by `state$`. |

### Events

| Event | When | Cancelable |
|---|---|---|
| `NavigateEvent` (`onNavigate`) | Before navigation | Yes |
| `NavigatedEvent` (`onNavigated`) | After navigation | No |

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `basename` | `string` | `undefined` | URL path prefix stripped from / prepended to consumer paths. |
| `history` | `History` | Browser history (or memory in Node) | History instance created via `createHistory()`. |
| `telemetry` | `ITelemetryProvider` | Auto-resolved | Tracks navigation events and errors. |
| `eventProvider` | `IEventModuleProvider` | Auto-resolved | Dispatches `onNavigate` / `onNavigated` events. |

## See Also

- [`@equinor/fusion-framework-react-router`](https://github.com/equinor/fusion-framework/tree/main/packages/react/router) — React Router integration
- [Navigation Cookbook](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-router) — Example application with routing

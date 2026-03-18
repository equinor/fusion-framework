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

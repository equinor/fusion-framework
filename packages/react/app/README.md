# @equinor/fusion-framework-react-app

React bindings for building modular Fusion Framework applications. Provides rendering helpers, configuration callbacks, and React hooks for accessing framework modules (HTTP, auth, context, navigation, bookmarks, settings, and more).

## Features

- **One-line app bootstrap** via `renderApp` — creates a render function that mounts your component with React 18's `createRoot`
- **Module hooks** — `useAppModule` / `useAppModules` for type-safe access to any registered module
- **Sub-path entry-points** for optional capabilities: MSAL auth, HTTP, context, navigation, bookmarks, feature flags, settings, analytics, AG Grid theming, help center, and apploader
- **Environment variables** hook — `useAppEnvironmentVariables` for accessing app config at runtime
- **Lazy loading** — components are wrapped in `React.lazy` + `Suspense` automatically

## Installation

```sh
pnpm add @equinor/fusion-framework-react-app
```

## Usage

### Bootstrap an application

```tsx
// config.ts
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator) => {
  configurator.http.configureClient('my-api', {
    baseUri: 'https://api.example.com',
    defaultScopes: ['api://my-api/.default'],
  });
};

// App.tsx
export const App = () => <h1>Hello Fusion</h1>;

// index.ts
import { renderApp } from '@equinor/fusion-framework-react-app';
import { App } from './App';
import { configure } from './config';

export const render = renderApp(App, configure);
export default render;
```

### Access a module

```tsx
import { useAppModule } from '@equinor/fusion-framework-react-app';

const MyComponent = () => {
  const auth = useAppModule('auth');
  // ...
};
```

### HTTP requests

```tsx
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';

const MyComponent = () => {
  const client = useHttpClient('my-api');
  // client.fetch$('endpoint').subscribe(...)
  // await client.fetchAsync('endpoint')
};
```

### MSAL authentication

> **Note:** Requires `@equinor/fusion-framework-module-msal`. The MSAL module must be configured by the host/portal — apps should only consume the hooks.

```tsx
import { useCurrentAccount, useAccessToken } from '@equinor/fusion-framework-react-app/msal';

const UserInfo = () => {
  const user = useCurrentAccount();
  const { token } = useAccessToken({ scopes: ['User.Read'] });
  if (!user) return <p>Not signed in</p>;
  return <p>Welcome, {user.name}</p>;
};
```

### Context

```tsx
import { useCurrentContext } from '@equinor/fusion-framework-react-app/context';

const ContextInfo = () => {
  const context = useCurrentContext();
  return <p>Selected: {context?.title ?? 'none'}</p>;
};
```

### Navigation / routing

```tsx
import { useRouter } from '@equinor/fusion-framework-react-app/navigation';
import { RouterProvider } from '@equinor/fusion-framework-react-router';

const routes = [{ path: '/', element: <Home /> }];

const App = () => {
  const router = useRouter(routes);
  return <RouterProvider router={router} />;
};
```

## State Management

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fstate%2Fpackage.json&label=@equinor/fusion-framework-module-state&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/state)

The Fusion Framework provides a powerful state management solution that enables persistent, cross-component state sharing with automatic synchronization. Unlike traditional React state that's lost on page refresh, this state persists across app sessions and stays synchronized between different components in real-time.

**Key Benefits:**
- 🔄 **Persistent State**: Survives page refreshes and app restarts
- 🔗 **Cross-Component Sync**: Share state between any components instantly
- ⚡ **Optimistic Updates**: Responsive UI with automatic rollback on errors
- 🛡️ **Type Safe**: Full TypeScript support with type inference
- 🎯 **Simple API**: Works like `useState` but with persistence

**Use Cases:**
- User preferences and settings
- Form data that should persist
- UI state like filters, sorting, or view modes
- Data that needs to be shared across multiple components
- Cache management for expensive operations

### Installation

First, install the state module package:

```sh
pnpm install @equinor/fusion-framework-module-state
```

### Setup

Enable the state module in your app configuration. This initializes the persistent storage and makes `useAppState` available throughout your application:

```typescript
import { enableAppState } from '@equinor/fusion-framework-react-app/state';
export const configure: ModuleInitiator = (appConfigurator) => {
  enableAppState(appConfigurator);
};
```

### Basic Usage

Use `useAppState` just like React's `useState`, but with automatic persistence. The first parameter is a unique key, and the second is an options object with the default value:

```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const Counter = () => {
  const [count, setCount] = useAppState('counter', { defaultValue: 0 });
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount((prev) => (prev ?? 0) + 1)}>Increment</button>
    </div>
  );
};
```

### Cross-Component Synchronization

Multiple components can share the same state by using the same key. Changes in one component automatically update all others:

```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const Incrementer = () => {
  const [count, setCount] = useAppState('counter', { defaultValue: 0 });
  return (
    <button onClick={() => setCount((prev) => (prev || 0) + 1)}>
      Increment
    </button>
  );
};

const Display = () => {
  const [count] = useAppState('counter', { defaultValue: 0 });
  return <span>Current count: {count}</span>;
};

// Usage in your app
const App = () => (
  <div>
    <Incrementer />
    <Display />
  </div>
);
```

### Best Practices

> [!WARNING]
> **Avoid Stale Closures**: When updating state based on the current value, always use the updater function to prevent stale closure issues in concurrent updates.
> 
> ```typescript
> const [count, setCount] = useAppState('counter', { defaultValue: 0 });
> 
> // ❌ Bad: Can use stale value in rapid updates
> const increment = () => setCount(count + 1);
> 
> // ✅ Good: Always gets the latest value
> const increment = () => setCount(prev => (prev || 0) + 1);
> ```

### Advanced Usage

**Complex Objects with TypeScript:**
```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const SettingsPanel = () => {
  const [settings, setSettings] = useAppState<UserPreferences>('user-settings', {
    defaultValue: { theme: 'light', language: 'en', notifications: true }
  });

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev!,
      theme: prev!.theme === 'light' ? 'dark' : 'light'
    }));
  };

  return <button onClick={toggleTheme}>Theme: {settings?.theme}</button>;
};
```

**Clearing State:**
```typescript
// Remove from storage completely
const clearSettings = () => setSettings(undefined);
```


### Feature flags

> **Note:** Requires `@equinor/fusion-framework-module-feature-flag`.

```tsx
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag';

export const configure: AppModuleInitiator = (configurator) => {
  enableFeatureFlag(configurator, [
    { key: 'dark-mode', title: 'Dark mode' },
    { key: 'beta-ui', title: 'Beta UI', allowUrl: true },
  ]);
};
```

```tsx
import { useFeature } from '@equinor/fusion-framework-react-app/feature-flag';

const Toggle = () => {
  const { feature, toggleFeature } = useFeature('dark-mode');
  return <Switch checked={feature?.enabled} onChange={() => toggleFeature()} />;
};
```

### Bookmarks

```tsx
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';

const BookmarkView = () => {
  const { currentBookmark } = useCurrentBookmark();
  return <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>;
};
```

### Settings

```tsx
import { useAppSetting } from '@equinor/fusion-framework-react-app/settings';

const ThemePicker = () => {
  const [theme, setTheme] = useAppSetting('theme', 'light');
  return <button onClick={() => setTheme('dark')}>Go dark</button>;
};
```

### Environment variables

```tsx
import { useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';

const EnvInfo = () => {
  const env = useAppEnvironmentVariables();
  if (!env.complete) return <p>Loading…</p>;
  return <pre>{JSON.stringify(env.value, null, 2)}</pre>;
};
```

## API Reference

### Core exports (main entry-point)

| Export | Description |
| --- | --- |
| `renderApp` | Creates a mount function from a component and optional config callback |
| `makeComponent` | Lazily initialises modules and wraps a component in framework providers |
| `createComponent` | _(deprecated)_ Factory returning a `ComponentRenderer` |
| `createLegacyApp` | _(deprecated)_ Wrapper for legacy Fusion CLI apps |
| `renderComponent` | Lower-level helper: mounts a `ComponentRenderer` via `createRoot` |
| `useAppModule(key)` | Returns a single module instance by key |
| `useAppModules()` | Returns all initialised application modules |
| `useAppEnvironmentVariables()` | Observable state of the app's environment config |

### Sub-path entry-points

| Path | Key exports |
| --- | --- |
| `/msal` | `useCurrentAccount`, `useAccessToken`, `useToken` |
| `/http` | `useHttpClient` (re-export) |
| `/http/selectors` | Response selector utilities |
| `/context` | `useCurrentContext`, `useContextProvider`, `useFrameworkCurrentContext` |
| `/navigation` | `useRouter`, `useNavigationModule` |
| `/feature-flag` | `enableFeatureFlag`, `useFeature` |
| `/bookmark` | `enableBookmark`, `useCurrentBookmark`, `useBookmark` |
| `/settings` | `useAppSetting`, `useAppSettings` |
| `/analytics` | `useTrackFeature` |
| `/help-center` | `useHelpCenter` |
| `/apploader` | `Apploader`, `useApploader` |
| `/framework` | `useFramework`, `useCurrentUser`, `useFrameworkHttpClient` |
| `/widget` | Widget entry-point |

## Configuration

Application configuration is done via a callback passed to `renderApp` (or `makeComponent`). The callback receives an `IAppConfigurator` with builders for each module:

```ts
const configure: AppModuleInitiator = (configurator) => {
  // HTTP clients
  configurator.http.configureClient('my-api', { baseUri: '...' });

  // Feature flags
  enableFeatureFlag(configurator, [{ key: 'beta', title: 'Beta' }]);

  // Navigation, context, etc. — see module docs
};
```

> The MSAL / auth module is configured by the host portal and hoisted to apps automatically. Do **not** configure it in application code.
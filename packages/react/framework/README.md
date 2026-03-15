# @equinor/fusion-framework-react

React bindings for bootstrapping and consuming a [Fusion Framework](https://github.com/equinor/fusion-framework) instance inside a React application tree.

## Features

- **Framework provider** — initialise and distribute the framework via React context with a single component or factory function.
- **`useFramework` hook** — access the active `Fusion` instance from any descendant component.
- **Module hooks** — retrieve individual framework modules (`useFrameworkModule`) without manual wiring.
- **App hooks** — observe the currently active application, query app manifests, and access app-level modules.
- **Context hook** — read the currently selected Fusion context.
- **Feature-flag hooks** — read, toggle, and observe feature flags at the framework or application level.
- **HTTP hook** — obtain pre-configured HTTP clients (`portal`, `people`) from the framework.
- **Auth hook** — retrieve the currently authenticated user.
- **SignalR hook** — subscribe to real-time SignalR hub topics.

## Installation

```sh
pnpm add @equinor/fusion-framework-react
```

## Usage

### Bootstrap the framework (declarative)

```tsx
import { Framework } from '@equinor/fusion-framework-react';

const App = () => (
  <Framework
    configure={(configurator) => {
      configurator.http.configureClient('my-api', {
        baseUri: 'https://api.example.com',
      });
    }}
    fallback={<span>Loading…</span>}
  >
    <MyApp />
  </Framework>
);
```

### Bootstrap the framework (factory)

```tsx
import { createFrameworkProvider } from '@equinor/fusion-framework-react';
import { Suspense, useMemo } from 'react';

const Portal = () => {
  const Provider = useMemo(
    () =>
      createFrameworkProvider((config) => {
        config.http.configureClient('my-api', {
          baseUri: 'https://api.example.com',
        });
      }),
    [],
  );

  return (
    <Suspense fallback={<span>Loading…</span>}>
      <Provider>
        <App />
      </Provider>
    </Suspense>
  );
};
```

### Consume the framework

```ts
import { useFramework } from '@equinor/fusion-framework-react';

const useMyService = () => {
  const fusion = useFramework();
  return fusion.modules.http.createClient('my-api');
};
```

### Get a specific module

```ts
import { useFrameworkModule } from '@equinor/fusion-framework-react';
import type { HttpModule } from '@equinor/fusion-framework-module-http';

const http = useFrameworkModule<HttpModule>('http');
```

## API Reference

### Components

| Export | Description |
| --- | --- |
| `Framework` | Declarative component that initialises the framework and wraps children in providers. |
| `FrameworkProvider` | Low-level React context provider for an existing `Fusion` instance. |

### Factory

| Export | Description |
| --- | --- |
| `createFrameworkProvider(cb, ref?)` | Creates a `React.lazy` component that initialises the framework asynchronously. Must be rendered inside `<Suspense>`. |

### Core hooks

| Hook | Description |
| --- | --- |
| `useFramework()` | Returns the active `Fusion` instance from context. |
| `useFrameworkModule(name)` | Returns a specific module from the framework by key. |

### App hooks (`/app`)

| Hook | Description |
| --- | --- |
| `useApps(args?)` | Lists available app manifests. |
| `useCurrentApp()` | Observes and returns the currently active app. |
| `useCurrentAppModule(key)` | Retrieves a module from the current app. |
| `useCurrentAppModules()` | Observes initialised modules of the current app. |
| `useAppProvider()` | Returns the raw `AppModule` provider. |

### Context hook (`/context`)

| Hook | Description |
| --- | --- |
| `useCurrentContext()` | Returns the currently selected Fusion context. |

### Feature-flag hooks (`/feature-flag`)

| Hook | Description |
| --- | --- |
| `useFeature(provider, key)` | Reads and toggles a single feature flag. |
| `useFeatures(provider, selector?)` | Returns all feature flags with optional filtering. |
| `useFrameworkFeature(key)` | Reads a feature flag from the framework provider. |
| `useFrameworkFeatures()` | Returns all framework-level feature flags. |
| `useCurrentAppFeatures()` | Returns feature flags for the current app. |

### HTTP hook (`/http`)

| Hook | Description |
| --- | --- |
| `useFrameworkHttpClient(name)` | Returns a pre-configured HTTP client. |

### Convenience hooks (`/hooks`)

| Hook | Description |
| --- | --- |
| `useHttpClient(name)` | Returns a framework HTTP client (`'portal'` or `'people'`). |
| `useCurrentUser()` | Returns the authenticated user's account info. |

### SignalR hook (`/signalr`)

| Hook | Description |
| --- | --- |
| `useSignalR(hubId, topicId)` | Subscribes to a SignalR hub topic. |

### Re-exported types

| Type | Source |
| --- | --- |
| `Fusion` | `@equinor/fusion-framework` |
| `FusionConfigurator` | `@equinor/fusion-framework` |
| `AppManifest`, `AppConfig`, `AppType`, `IApp` | `@equinor/fusion-framework-module-app` |
| `IFeatureFlag`, `IFeatureFlagProvider` | `@equinor/fusion-framework-module-feature-flag` |

## Sub-entry-points

The package exposes several sub-entry-points for tree-shakeable imports:

- `@equinor/fusion-framework-react` — core providers and hooks
- `@equinor/fusion-framework-react/app` — application hooks
- `@equinor/fusion-framework-react/context` — context hooks
- `@equinor/fusion-framework-react/feature-flag` — feature-flag hooks
- `@equinor/fusion-framework-react/hooks` — convenience hooks
- `@equinor/fusion-framework-react/http` — HTTP hooks
- `@equinor/fusion-framework-react/signalr` — SignalR hooks
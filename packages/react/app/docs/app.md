# App (Root Entry Point)

Core bootstrapping and module access hooks for Fusion React applications.

**Import:**

```ts
import { renderApp, useAppModule, useAppModules, useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';
```

## renderApp

The standard bootstrap function for Fusion React apps. Wraps your root component and an optional configuration callback into a render function that the Fusion portal calls to mount your app.

**Signature:**

```ts
function renderApp(
  Component: React.ElementType,
  configure?: AppModuleInitiator,
): (el: HTMLElement, args: ComponentRenderArgs) => RenderTeardown;
```

`AppModuleInitiator` receives `(configurator, { fusion, env })` and may return `Promise<void>` for async setup.

**Returns:** A mount function the portal calls with a DOM element and render args. The returned `RenderTeardown` callback unmounts the app.

### How to Use

Export `renderApp` as your app's `render` entrypoint:

```ts
// main.ts
import { renderApp } from '@equinor/fusion-framework-react-app';
import { App } from './App';
import { configure } from './config';

export const render = renderApp(App, configure);
export default render;
```

The `configure` callback is an `AppModuleInitiator` — it receives `(configurator, { fusion, env })` and may be async:

```ts
// config.ts
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator) => {
  configurator.configureHttpClient('my-api', {
    baseUri: 'https://api.example.com',
    defaultScopes: ['api://my-api/.default'],
  });
};
```

## useAppModule

Retrieves a single typed module instance from the application scope. Throws if the module is not registered.

**Signature:**

```ts
// Key-based inference (no explicit generic needed for known modules):
function useAppModule(module: 'auth' | 'context' | ...): InferredModuleType;

// Explicit generic for custom/unknown module keys:
function useAppModule<TType extends AnyModule>(module: string): ModuleType<TType>;
```

When called with a known string literal key (e.g. `'auth'`), the return type is inferred automatically. Pass an explicit generic only when using a custom or unrecognised key.

**Example:**

```tsx
import { useAppModule } from '@equinor/fusion-framework-react-app';

const MyComponent = () => {
  const auth = useAppModule('auth');
  // auth is typed based on the registered module
  return <button onClick={() => auth.acquireAccessToken()}>Get token</button>;
};
```

## useAppModules

Returns the full set of initialised application-scoped modules. Use this when you need to inspect or access multiple modules at once — prefer `useAppModule` for single-module access.

**Signature:**

```ts
function useAppModules<T>(): AppModulesInstance<T>;
```

**Example:**

```tsx
import { useAppModules } from '@equinor/fusion-framework-react-app';

const DebugPanel = () => {
  const modules = useAppModules();
  return <pre>{Object.keys(modules).join(', ')}</pre>;
};
```

## useAppEnvironmentVariables

Returns the app's environment variables as an observable state. The value is loaded asynchronously from the app configuration, so you should handle `complete` and `error` states.

**Signature:**

```ts
function useAppEnvironmentVariables<TEnvironmentVariables>(): ObservableStateReturnType<TEnvironmentVariables>;
```

**Returns:**

| Property   | Type                         | Description                                          |
| ---------- | ---------------------------- | ---------------------------------------------------- |
| `value`    | `TEnvironmentVariables \| undefined` | The resolved environment variables, or `undefined` before the observable emits |
| `complete` | `boolean`                           | `true` when loading is finished                                                |
| `error`    | `unknown \| null`                   | Error if loading failed, `null` otherwise                                      |

**Example:**

```tsx
import { useAppEnvironmentVariables } from '@equinor/fusion-framework-react-app';

type MyEnv = {
  apiUrl: string;
  featureFlags: Record<string, boolean>;
};

const MyComponent = () => {
  const env = useAppEnvironmentVariables<MyEnv>();

  if (!env.complete) return <p>Loading environment…</p>;
  if (env.error) return <p>Failed to load environment</p>;

  return <p>API URL: {env.value.apiUrl}</p>;
};
```

## Deprecated APIs

> [!CAUTION]
> `createComponent` is **deprecated**. Use `renderApp` instead.

These older bootstrapping functions are still exported for backward compatibility but should not be used in new apps.

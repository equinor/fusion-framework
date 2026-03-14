# @equinor/fusion-framework-module-feature-flag

Fusion Framework module for managing feature flags in applications. Provides a plugin-based architecture for defining, persisting, and toggling feature flags from multiple sources such as local storage, URL query parameters, or a remote API.

## Features

- **Plugin architecture** — compose multiple flag sources (local storage, URL, API) into one provider.
- **Local-storage persistence** — toggled flags survive page reloads via `createLocalStoragePlugin`.
- **URL toggle** — enable or disable flags through query parameters with `createUrlPlugin`.
- **Remote API** — fetch flags from an HTTP endpoint using `createApiPlugin`.
- **Observable state** — subscribe to flag changes via RxJS observables.
- **Framework events** — emits `onFeatureFlagToggle` (cancelable) and `onFeatureFlagsToggled` when the event module is present.
- **Typed values** — flags can carry a generic typed payload (`IFeatureFlag<T>`).

## Installation

```sh
pnpm add @equinor/fusion-framework-module-feature-flag
```

## Usage

### Register the module

```ts
import { enableFeatureFlagging } from '@equinor/fusion-framework-module-feature-flag';
import {
  createLocalStoragePlugin,
  createUrlPlugin,
} from '@equinor/fusion-framework-module-feature-flag/plugins';

export const configure = (configurator) => {
  enableFeatureFlagging(configurator, (builder) => {
    // Persist toggled state in localStorage
    builder.addPlugin(
      createLocalStoragePlugin([
        { key: 'dark-mode', title: 'Dark mode' },
        { key: 'beta-search', title: 'Beta search', enabled: false },
      ]),
    );
    // Allow toggling via URL: ?beta-search=true
    builder.addPlugin(createUrlPlugin(['beta-search']));
  });
};
```

### Read flags at runtime

```ts
const featureFlags = modules.featureFlag;

// Check a single flag
if (featureFlags.getFeature('dark-mode')?.enabled) {
  applyDarkTheme();
}

// Observe changes
featureFlags.features$.subscribe((features) => {
  console.log('Current flags:', features);
});
```

### Toggle flags programmatically

```ts
await featureFlags.toggleFeature({ key: 'dark-mode', enabled: true });
```

### Fetch flags from an API

```ts
import { createApiPlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';

builder.addPlugin(
  createApiPlugin({
    httpClientName: 'my-api',
    path: '/feature-flags',
  }),
);
```

## API Reference

### Main exports (`@equinor/fusion-framework-module-feature-flag`)

| Export | Description |
| --- | --- |
| `enableFeatureFlagging` | Registers the module on a configurator with an optional builder callback. |
| `featureFlagModule` / `default` | Module descriptor for manual registration. |
| `FeatureFlagProvider` | Manages flag state, toggling, and subscriptions. |
| `FeatureFlagConfigurator` | Builder for registering plugins during configuration. |
| `IFeatureFlag<T>` | Interface describing a single feature flag. |
| `FeatureFlagPlugin` | Interface for plugins that supply and persist flags. |

### Plugin exports (`@equinor/fusion-framework-module-feature-flag/plugins`)

| Export | Description |
| --- | --- |
| `createLocalStoragePlugin` | Persists flag state in `localStorage` (or `sessionStorage`). |
| `createUrlPlugin` | Reads flag state from URL query parameters on navigation. |
| `createApiPlugin` | Fetches flags from a remote HTTP endpoint. |

### Selector exports (`@equinor/fusion-framework-module-feature-flag/selectors`)

| Export | Description |
| --- | --- |
| `filterFeatures` | RxJS operator that filters an observable feature map by a selector function. |
| `findFeature` | RxJS operator that emits a single flag matching a key or predicate. |

## Configuration

The module is configured through `enableFeatureFlagging(configurator, callback)`. Inside the callback you receive an `IFeatureFlagConfigurator` builder with the following methods:

| Method | Description |
| --- | --- |
| `addPlugin(handler)` | Registers a custom plugin factory. |
| `enableLocalFeatures(...args)` | Shortcut for `createLocalStoragePlugin` _(deprecated)_. |
| `enableUrlToggle(...args)` | Shortcut for `createUrlPlugin`. |

### Plugin lifecycle

1. During configuration each plugin factory is registered via `addPlugin`.
2. At module initialisation every factory is called with `ConfigBuilderCallbackArgs`.
3. Each plugin returns its `initial()` flags and an optional `connect()` hook.
4. The provider merges all initial flags and invokes `connect()` so plugins can subscribe to toggle events (e.g. to persist changes).
10. the configurator return an instance of the config
11. the module create a provider instance
12. the provider connects the plugins
13. the provider subscribes to toggle actions and connects plugin toggle handlers
14. the module returns the feature flag module to the framework

```ts
export interface FeatureFlagPlugin {
    /**
     * connect the plugin to the provider
     */
    connect: (args: { provider: IFeatureFlagProvider }) => VoidFunction | Subscription;

    /**
     * generate initial value for the provider
     */
    initial?: () => ObservableInput<Array<IFeatureFlag>>;
}
```

### Local Storage

`import { createLocalStoragePlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';`

plugin for allowing to store the toggled state of a feature flag


### Url

`import { createUrlPlugin } from '@equinor/fusion-framework-module-feature-flag/plugins';`

plugin for toggling features threw url search params

### Custom

__initial__

async callback function which returns the initial feature flags of the plugin

__connect__

async callback which allows the plugin to connect to the feature flag provider

```ts
import { 
  enableFeatureFlagging, 
  type FeatureFlagPluginConfigCallback 
} from '@equinor/fusion-framework-module-feature-flag';

const customPlugin: FeatureFlagPluginConfigCallback = async (args) => {
  const myModule = await args.requireModule('my-module');
  return {
    initial: () => fetch('/api/features')
      .then(res => res.json())
      .then(features => features.map(feature => feature.source = 'my-source')),
    connect: ({provider}) => {
      /** subscribe to changes of feature flags */
      provider.onFeatureToggle: async({flags}) => {
        await fetch(
          '/api/me/features', 
          { 
            method: 'PATCH', 
            body: flags.filter(feature => feature.source === 'my-source')
          }
        )
      }
      /** update feature flags */
      signalR.received(data => {
        provider.setFeatures(data.map(feature => feature.source = 'my-source'));
      });
    },
  }
}

// ...configuration
enableFeatureFlagging(builder => {
  builder.addPlugin(customPlugin);
})
```

## Selectors

### Filter features

Operator function for filtering out specific features 

```ts
import { filterFeatures } from '@equinor/fusion-framework-module-feature-flag/selectors';
const features$ = modules.featureFlag.feature$.pipe(
  filterFeatures(x => x.enabled = true);
);
```

### Find feature

Operator for selecting a specific feature

> [!IMPORTANT]
> The operator will not re-emit unless value or selector changes

```ts
import { findFeature } from '@equinor/fusion-framework-module-feature-flag/selectors';
const feature$ = modules.featureFlag.feature$.pipe('my-key');
```

## Events

### onFeatureFlagToggle

Event fired before a feature is toggled

### onFeatureFlagsToggled

Event fired after features are toggled _(state updated)_

## Usage


```tsx
// my-code.ts
const provider = modules.featureFlag;
const fooEnabled = provider.getFeatures('foo').enabled;
console.log('feature foo is ', fooEnabled ? 'enabled' : 'disabled');
```

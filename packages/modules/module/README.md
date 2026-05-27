# @equinor/fusion-framework-module

Core module system for Fusion Framework. This package defines the contracts, base classes, and orchestration logic that every Fusion Framework module relies on.

Use this package when you are **authoring a new module** or need to understand how the module lifecycle works. Application developers typically consume modules through higher-level packages such as `@equinor/fusion-framework-react`.

## Key Concepts

### Module

A `Module` is a plain object that declares a name, an optional configuration factory, an `initialize` method, and optional lifecycle hooks (`postConfigure`, `postInitialize`, `dispose`). Modules are the building blocks of a Fusion application.

### ModulesConfigurator

`ModulesConfigurator` orchestrates the full module lifecycle:

1. **Configure** – each module's `configure()` factory creates a config builder; registered callbacks mutate it; `postConfigure()` hooks run.
2. **Initialize** – modules are initialized concurrently; cross-module dependencies are resolved through `requireInstance()`.
3. **Post-initialize** – `postInitialize()` hooks and `onInitialized` callbacks run.
4. **Plugins** – registered plugins connect host-level side effects after every module is ready.

The result is a sealed `ModulesInstance` whose property names match the module keys and whose values are the initialized providers.

### BaseConfigBuilder

An abstract class for building module configuration declaratively. Subclasses expose typed setter methods (e.g. `setBaseUrl`) that register callbacks. During initialization the framework collects all registered callbacks, resolves them, and merges the results into a single configuration object.

### BaseModuleProvider

Abstract base class for module providers (the runtime instances returned by `initialize()`). It manages a `Subscription` container for automatic teardown and exposes a `SemanticVersion` for compatibility checks.

## Documentation

| Topic | Description |
|---|---|
| [Concepts](./docs/concepts.md) | Module system overview, roles, and mental model |
| [Lifecycle](./docs/lifecycle.md) | Configure → initialize → post-initialize → dispose phase sequence |
| [Configuration](./docs/configuration.md) | How to register modules and use `addConfig` / `configure` |
| [Cross-Module Dependencies](./docs/cross-module-deps.md) | `requireInstance` pattern for inter-module dependencies |
| [Plugins](./docs/plugins.md) | `registerPlugin`, `createPlugin`, plugin teardown, and host-level side effects |
| [Events](./docs/events.md) | `event$` observable and event naming conventions |
| [Authoring Modules](./docs/authoring-modules.md) | Step-by-step guide for creating a custom module |
| [Common Mistakes](./docs/common-mistakes.md) | FAQ-style pitfalls and how to avoid them |

## Installation

```sh
pnpm add @equinor/fusion-framework-module
```

## Quick Start — Defining a Module

```typescript
import {
  type Module,
  BaseConfigBuilder,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

// 1. Define the configuration shape
interface GreeterConfig {
  greeting: string;
}

// 2. Create a config builder
class GreeterConfigurator extends BaseConfigBuilder<GreeterConfig> {
  setGreeting(cb: ConfigBuilderCallback<string>) {
    this._set('greeting', cb);
  }
}

// 3. Create a provider
class GreeterProvider extends BaseModuleProvider<GreeterConfig> {
  #config: GreeterConfig;

  greet(name: string): string {
    return `${this.#config.greeting}, ${name}!`;
  }

  constructor(args: { version: string; config: GreeterConfig }) {
    super(args);
    this.#config = args.config;
  }
}

// 4. Define the module
export const greeterModule: Module<'greeter', GreeterProvider, GreeterConfigurator> = {
  name: 'greeter',
  configure: () => new GreeterConfigurator(),
  initialize: async ({ config }) => {
    const resolved = await config.createConfigAsync({
      config: {},
      hasModule: () => false,
      requireInstance: () => Promise.reject('no modules'),
    });
    return new GreeterProvider({ version: '1.0.0', config: resolved });
  },
};
```

## Exports

### Main Entry Point (`@equinor/fusion-framework-module`)

| Export | Kind | Description |
|---|---|---|
| `Module` | type | Interface describing a module's structure and lifecycle hooks |
| `ModulesConfigurator` | class | Orchestrates configure → initialize → plugin → dispose for a set of modules |
| `IModulesConfigurator` | interface | Public contract for the modules configurator |
| `IModuleConfigurator` | interface | Descriptor for registering a single module with lifecycle hooks |
| `BaseConfigBuilder` | class | Abstract config builder with dot-path targeting and observable pipelines |
| `ConfigBuilderCallback` | type | Callback signature used by config builder setters |
| `ConfigBuilderCallbackArgs` | type | Arguments passed to config builder callbacks |
| `ModuleConfigBuilder` | class | *Deprecated* – use `BaseConfigBuilder` instead |
| `initializeModules` | function | Convenience wrapper around `configurator.initialize()` |
| `SemanticVersion` | class | Extended `SemVer` with a `satisfies()` method |
| `ModuleConsoleLogger` | class | Styled console logger with module-name formatting |
| `IModuleConsoleLogger` | interface | Logger interface with `formatModuleName` |
| `DotPath`, `DotPathType`, `DotPathUnion` | types | Recursive dot-notation path utilities |

### Configurator Sub-path (`@equinor/fusion-framework-module/configurator`)

| Export | Kind | Description |
|---|---|---|
| `ModuleConfiguratorEventBaseName` | const | Shared `ModuleConfigurator` base segment for configurator lifecycle event names |
| `ModuleConfiguratorEventName` | object | Map of `ModuleConfigurator.{name}.{state}` event names for filtering `event$` without hard-coded strings |

### Plugins Sub-path (`@equinor/fusion-framework-module/plugins`)

| Export | Kind | Description |
|---|---|---|
| `createPlugin` | function | Creates a named plugin callback for stable lifecycle diagnostics |
| `FrameworkPluginArgs` | type | Arguments passed to inline plugin callbacks: initialized modules and optional ref |
| `FrameworkPluginCallback` | type | Callback accepted by `IModulesConfigurator.registerPlugin` |
| `FrameworkPluginTeardown` | type | Cleanup callback or disposable object returned by a plugin |
| `FrameworkPluginRegistration` | type | Plugin return type: teardown or `undefined` |
| `FrameworkPlugin` | interface | Named plugin callback returned by `createPlugin` |
| `FrameworkPluginInitializer` | type | Developer-facing callback signature used by `createPlugin` |

### Provider Sub-path (`@equinor/fusion-framework-module/provider`)

| Export | Kind | Description |
|---|---|---|
| `IModuleProvider` | interface | Contract every module provider must satisfy |
| `BaseModuleProvider` | class | Abstract base with version, subscription management, and dispose |
| `BaseModuleProviderCtorArgs` | type | Constructor arguments for `BaseModuleProvider` |

## Module Lifecycle

```
┌─────────────────────────────────────────────────────┐
│                  ModulesConfigurator                 │
├──────────┬──────────────────────────┬────────────────┤
│ Phase    │ Module Hook              │ Consumer Hook  │
├──────────┼──────────────────────────┼────────────────┤
│ Configure│ module.configure()       │ addConfig()    │
│          │ module.postConfigure()   │ onConfigured() │
├──────────┼──────────────────────────┼────────────────┤
│ Init     │ module.initialize()      │                │
│          │ module.postInitialize()  │ onInitialized()│
├──────────┼──────────────────────────┼────────────────┤
│ Plugin   │                          │ registerPlugin │
├──────────┼──────────────────────────┼────────────────┤
│ Dispose  │ module.dispose()         │ instance.      │
│          │                          │  dispose()     │
└──────────┴──────────────────────────┴────────────────┘
```

### Cross-module dependencies with requireInstance

Modules initialize concurrently. Use `requireInstance(name, timeout?)` inside `initialize` to wait for a dependency:

```typescript
initialize: async ({ config, requireInstance, hasModule }) => {
  // Wait for the event module (with optional timeout in ms)
  const event = await requireInstance('event', 5000);
  return new MyProvider(config, event);
},
```

`requireInstance` returns a promise that resolves when the requested module finishes initializing. If the module is not registered, the promise rejects.

### postInitialize and the full modules map

`postInitialize` runs after **all** modules are initialized. It receives the full `modules` map, making it the right place for cross-module wiring that depends on every module being ready:

```typescript
postInitialize: async ({ instance, modules }) => {
  // All modules are available here
  modules.event.addEventListener('onContextChanged', (e) => {
    instance.handleContextChange(e.detail);
  });
},
```

`configure` and `initialize` are the two required hooks. `postConfigure`, `postInitialize`, and `dispose` are optional.

### Plugins and host-level side effects

Use `registerPlugin` for application-owned wiring that needs the complete module instance before render. Plugins run after `postInitialize` and `onInitialized`, but before `initialize()` resolves. Return a teardown callback to clean up subscriptions, global listeners, timers, or telemetry bindings during dispose.

```typescript
import { createPlugin } from '@equinor/fusion-framework-module/plugins';

const contextTelemetryPlugin = createPlugin<[typeof eventModule, typeof telemetryModule]>(
  'contextTelemetry',
  (modules) => modules.event.addEventListener('context:changed', (event) => {
    modules.telemetry.track('context.changed', event.detail);
  }),
);

configurator.registerPlugin(contextTelemetryPlugin);
```

See [Plugins](./docs/plugins.md) for teardown rules, failure behavior, and API reference.

Events are emitted on `configurator.event$` throughout the lifecycle for telemetry and debugging.

## Related Packages

- `@equinor/fusion-framework-react` – React bindings and hooks for consuming modules
- `@equinor/fusion-framework-module-http` – HTTP client module built on this system
- `@equinor/fusion-framework-module-service-discovery` – Service discovery module

# Core

Core framework patterns covering module system architecture, provider initialization, configuration, and the fundamental building blocks that all Fusion Framework applications depend on.

## Pattern: Initialize framework with FrameworkConfigurator and init

**Requirement:** `must`

Portal shells and standalone application hosts must use `FrameworkConfigurator` to collect module configuration and `init` to bootstrap the framework. The `init` function resolves all modules, assigns the result to `window.Fusion`, and dispatches the `onFrameworkLoaded` event. Micro-frontend apps running inside an already-initialized portal should use `@equinor/fusion-framework-react-app` instead.

### Example

```typescript
import { FrameworkConfigurator, init } from '@equinor/fusion-framework';

const configurator = new FrameworkConfigurator();
configurator.configureMsal({
  clientId: '<your-client-id>',
  authority: 'https://login.microsoftonline.com/<your-tenant-id>',
});
configurator.configureServiceDiscovery({
  client: { baseUri: 'https://service-registry.example.com' },
});

const fusion = await init(configurator);
console.log(fusion.modules); // fully initialized module instances
```

### File references

- `packages/framework/src/FrameworkConfigurator.ts` — configurator class with typed helpers (`configureMsal`, `configureHttp`, `configureHttpClient`, `configureServiceDiscovery`)
- `packages/framework/src/init.ts` — async `init` function that bootstraps the framework
- `packages/framework/src/types.ts` — `FusionModules`, `Fusion`, and `FusionModulesInstance` type definitions

### Notes

- `FusionConfigurator` is deprecated — always use `FrameworkConfigurator`
- `init` sets `window.Fusion` globally so portal shells and widgets can access the running instance
- The configurator registers the built-in module set: event, MSAL, HTTP, service-discovery, services, context, and telemetry

## Pattern: Define a module with the Module interface

**Requirement:** `must`

Every Fusion Framework module must be a plain object satisfying the `Module<TKey, TType, TConfig, TDeps>` interface from `@equinor/fusion-framework-module`. A module declares a unique `name`, an optional `configure` factory that creates a config builder, and a required `initialize` method that returns the runtime provider instance.

### Example

```typescript
import {
  type Module,
  BaseConfigBuilder,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';
import { BaseModuleProvider } from '@equinor/fusion-framework-module/provider';

// 1. Configuration shape
interface GreeterConfig {
  greeting: string;
}

// 2. Config builder with typed setters
class GreeterConfigurator extends BaseConfigBuilder<GreeterConfig> {
  setGreeting(cb: ConfigBuilderCallback<string>) {
    this._set('greeting', cb);
  }
}

// 3. Runtime provider
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

// 4. Module definition
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

### File references

- `packages/modules/module/src/types.ts` — `Module`, `AnyModule`, `ModuleInitializerArgs` type definitions
- `packages/modules/module/src/BaseConfigBuilder.ts` — abstract config builder base class
- `packages/modules/module/src/lib/provider/BaseModuleProvider.ts` — abstract base class for module providers
- `packages/modules/module/src/lib/provider/IModuleProvider.ts` — provider interface contract

### Notes

- The `name` field must be unique across all registered modules — it becomes the property key on the resolved `ModulesInstance`
- Extend `BaseConfigBuilder` for declarative config with dot-path targeting; extend `BaseModuleProvider` for automatic subscription teardown and version tracking
- `ModuleConfigBuilder` is deprecated — use `BaseConfigBuilder` instead

## Pattern: Module lifecycle phases

**Requirement:** `should`

Module authors should understand and use the full lifecycle managed by `ModulesConfigurator`: configure → postConfigure → initialize → postInitialize → dispose. Each phase enables specific setup and teardown behaviors.

### Example

```typescript
import type { Module } from '@equinor/fusion-framework-module';

export const myModule: Module<'my', MyProvider, MyConfigurator> = {
  name: 'my',

  // Phase 1: Create configurator
  configure: () => new MyConfigurator(),

  // Phase 2: React to completed configuration (all modules configured)
  postConfigure: (config) => {
    console.log('All module configs ready:', Object.keys(config));
  },

  // Phase 3: Create provider instance (can require other module instances)
  initialize: async ({ config, requireInstance, hasModule }) => {
    // Use requireInstance to depend on another module
    if (hasModule('event')) {
      const event = await requireInstance('event');
      // use event module during initialization
    }
    return new MyProvider(config);
  },

  // Phase 4: Post-initialization (all modules instantiated)
  postInitialize: async ({ instance, modules }) => {
    console.log('Module ready, all modules available:', Object.keys(modules));
  },

  // Phase 5: Cleanup
  dispose: ({ instance }) => {
    instance.teardown();
  },
};
```

### File references

- `packages/modules/module/src/configurator.ts` — `ModulesConfigurator` orchestration logic
- `packages/modules/module/src/types.ts` — `Module` interface with all lifecycle hooks
- `packages/modules/module/README.md` — lifecycle phase diagram

### Notes

- `configure` and `initialize` are the two essential hooks; `postConfigure`, `postInitialize`, and `dispose` are optional
- Use `requireInstance(name, timeout?)` in `initialize` to depend on another module — modules initialize concurrently and `requireInstance` waits for the dependency
- `postInitialize` receives the full `modules` map, making it the right place for cross-module wiring after all modules are ready

## Pattern: Configure application modules with AppModuleInitiator

**Requirement:** `must`

Micro-frontend applications running inside a Fusion portal must export a configuration callback of type `AppModuleInitiator` from `@equinor/fusion-framework-react-app`. This callback receives the app-level `configurator` and environment object. Use `onConfigured` and `onInitialized` hooks from the configurator to react to lifecycle transitions.

### Example

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator, env) => {
  console.log('configuring application', env);

  // React when all module configurations are built
  configurator.onConfigured((config) => {
    console.log('application config created', config);
  });

  // React when all application modules are initialized
  configurator.onInitialized((instance) => {
    console.log('application modules initialized', instance);
  });
};

export default configure;
```

### File references

- `cookbooks/app-react/src/config.ts` — canonical cookbook example of app configuration
- `packages/app/src/types.ts` — `AppModuleInitiator` type definition (re-exported from `@equinor/fusion-framework-react-app`)

### Notes

- The `env` parameter provides the render environment (manifest, basename, etc.)
- `onConfigured` fires after all module configs are resolved but before initialization
- `onInitialized` fires after all module providers are created — use it for post-setup logging or cross-module wiring

## Pattern: Listen to framework events with addEventListener

**Requirement:** `must`

Modules and applications must use `addEventListener` on the event module to listen for framework events. Listeners for `cancelable` events must be registered before the event is dispatched. When dispatching a cancelable event, the `dispatchEvent` call must be `await`ed — firing without `await` means `preventDefault()` calls from listeners will not be respected.

### Example

```typescript
// Listen to a framework event
const teardown = modules.event.addEventListener('onModulesLoaded', (event) => {
  console.log('All modules loaded:', event.detail);
});
// Remove the listener when no longer needed
teardown();

// Dispatch a cancelable event — must await
const event = await modules.event.dispatchEvent('myEvent', {
  detail: { id: 42 },
  cancelable: true,
});
if (event.canceled) {
  // A listener called event.preventDefault()
  return;
}
```

**Requirement:** `should`

Module authors should register custom event types via TypeScript declaration merging on `FrameworkEventMap` for type-safe `addEventListener` and `dispatchEvent` calls.

### Example

```typescript
import type {
  FrameworkEvent,
  FrameworkEventInit,
} from '@equinor/fusion-framework-module-event';

interface MyPayload {
  id: string;
  value: number;
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    myFeature: FrameworkEvent<FrameworkEventInit<MyPayload>>;
  }
}

// Now type-safe
modules.event.addEventListener('myFeature', (event) => {
  console.log(event.detail.id); // typed as string
});
```

### File references

- `packages/modules/event/src/provider.ts` — `EventModuleProvider` with `addEventListener`, `dispatchEvent`, and `event$`
- `packages/modules/event/src/event.ts` — `FrameworkEvent` base class
- `packages/modules/event/src/filter-event.ts` — `filterEvent` RxJS operator for narrowing `event$`
- `packages/modules/event/README.md` — event lifecycle, cancelable events, and bubbling documentation

### Notes

- `addEventListener` returns a teardown function — call it to unsubscribe
- The `event$` observable emits events after dispatch and cannot call `preventDefault` or `stopPropagation`; use `addEventListener` for side-effect-capable handling
- Events bubble to parent providers by default (`canBubble: true`); call `event.stopPropagation()` to prevent it
- Use `filterEvent` from `@equinor/fusion-framework-module-event` to narrow `event$` to a specific event type

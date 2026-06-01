# Authoring Modules — @equinor/fusion-framework-module

This guide walks through creating a complete Fusion Framework module from scratch. By the end you will have a typed module definition, a config builder that consumers can call, and a provider that the framework returns after initialization.

## When to author a module

Write a new module when you need to package a runtime capability — a client, a service, a store — in a way that:

- can be configured independently by each consumer
- can depend on other modules through the standard dependency resolution mechanism
- can be reused across multiple applications without bundling application-specific configuration

If you just need a utility function or a shared class, you do not need a module.

## The three pieces

Every module is made up of three separate artifacts: a **module definition** (plain object with lifecycle hooks), a **config builder** (collects consumer configuration), and a **provider** (the live runtime object). Keeping them separate means you can test each one independently — a config builder test does not need a running provider.

---

## Step 1 — Define the resolved config shape

Start by thinking about what your module needs to know at runtime. Write a plain TypeScript interface for it. This is the shape that `initialize` receives — not the shape consumers set, but the shape the module itself reads.

```typescript
// The fully-resolved config the module reads at initialize time.
// Keep this a plain interface; no classes, no observables.
interface GreeterConfig {
  greeting: string;
  punctuation: string;
}
```

---

## Step 2 — Create the config builder

The config builder is what consumers interact with in their `configure` callback. Extend `BaseConfigBuilder<YourConfig>` and expose one setter per configurable value. Each setter accepts a `ConfigBuilderCallback` — a function that receives the current partial config and returns the new value. This allows async configuration and per-key override chaining.

```typescript
import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';

class GreeterConfigurator extends BaseConfigBuilder<GreeterConfig> {
  /**
   * Set the greeting word. Defaults to 'Hello' if not called.
   */
  setGreeting(cb: ConfigBuilderCallback<string>): void {
    this._set('greeting', cb);
  }

  /**
   * Set the punctuation. Defaults to '!' if not called.
   */
  setPunctuation(cb: ConfigBuilderCallback<string>): void {
    this._set('punctuation', cb);
  }
}
```

`_set(key, callback)` registers the callback under the given dot-path key. When `createConfigAsync` is called during initialization, all registered callbacks are resolved in registration order and merged into the final config object.

**Tip:** Add defaults inside the module's `configure()` factory (step 4), not inside the setter. This lets consumers override defaults simply by calling the setter — no special "reset" path needed.

---

## Step 3 — Create the provider

The provider is the live runtime object. It is what consumers get when they access `modules.greeter`. Extend `BaseModuleProvider` to inherit version tracking, a managed `Subscription` container, and a `dispose()` hook.

```typescript
import { BaseModuleProvider, type BaseModuleProviderCtorArgs } from '@equinor/fusion-framework-module/provider';

class GreeterProvider extends BaseModuleProvider {
  readonly #greeting: string;
  readonly #punctuation: string;

  constructor(args: BaseModuleProviderCtorArgs & { config: GreeterConfig }) {
    super(args);
    this.#greeting = args.config.greeting;
    this.#punctuation = args.config.punctuation;
  }

  greet(name: string): string {
    return `${this.#greeting}, ${name}${this.#punctuation}`;
  }
}
```

If your provider sets up subscriptions or timers, add them to `this.subscription` so they are cancelled automatically when the framework calls `dispose`:

```typescript
constructor(args: BaseModuleProviderCtorArgs & { config: GreeterConfig; feed$: Observable<string> }) {
  super(args);
  this.#greeting = args.config.greeting;
  this.#punctuation = args.config.punctuation;

  // Automatically cancelled when dispose() is called.
  this.subscription.add(
    args.feed$.subscribe((msg) => console.log(msg)),
  );
}
```

---

## Step 4 — Declare the module

Tie everything together in the module definition. The four generic parameters — `'greeter'`, `GreeterProvider`, `GreeterConfigurator`, `[]` — are the source of truth for the type system. Get them right once and everything else flows.

```typescript
import { type Module } from '@equinor/fusion-framework-module';

export type GreeterModule = Module<'greeter', GreeterProvider, GreeterConfigurator>;

export const greeterModule: GreeterModule = {
  name: 'greeter',

  // Create a fresh config builder for each initialization.
  // Set defaults here so consumers can override them with setters.
  configure: () => {
    const builder = new GreeterConfigurator();
    builder.setGreeting(() => 'Hello');
    builder.setPunctuation(() => '!');
    return builder;
  },

  // Build the provider from the resolved config.
  initialize: async ({ config }) => {
    const resolved = await config.createConfigAsync({
      config: {},
      hasModule: () => false,
      requireInstance: async () => { throw new Error('no modules'); },
    });
    return new GreeterProvider({ version: '1.0.0', config: resolved });
  },
};
```

**Exporting the module type** (`GreeterModule`) as a named type lets other modules declare it as a dependency in their `TDeps` generic.

---

## Step 5 — Write an enable function (optional but recommended)

Convention in Fusion Framework is to ship an `enableXxx` function alongside the module. This gives consumers a one-liner API and a single place to express configuration:

```typescript
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

export function enableGreeter(
  configurator: IModulesConfigurator<any, any>,
  configure?: (builder: GreeterConfigurator) => void,
): void {
  configurator.addConfig({
    module: greeterModule,
    configure,
  });
}
```

Consumers can then write:

```typescript
enableGreeter(configurator, (builder) => {
  builder.setGreeting(() => 'Hei');
});
```

---

## Step 6 — Add optional lifecycle hooks

Add only the hooks you actually need. Each hook is optional.

### `postConfigure` — inspect the full config map

Use this when your module's defaults depend on what another module configured. For example, an HTTP module might read the base URL from a service-discovery config:

```typescript
postConfigure: async (configMap) => {
  // configMap contains the resolved configs of ALL modules.
  const discoveryConfig = configMap['serviceDiscovery'];
  if (discoveryConfig && !configMap['greeter'].greeting) {
    configMap['greeter'].greeting = discoveryConfig.defaultGreeting;
  }
},
```

### `postInitialize` — wire providers together

Use this when your module needs a live reference to another provider. At this point every module in the system has finished initializing:

```typescript
postInitialize: async ({ instance, modules }) => {
  // Subscribe to another module's event stream using the live provider.
  const sub = modules.event.on('localeChanged', (locale) => {
    instance.updateLocale(locale);
  });
  instance.subscription.add(sub);
},
```

### `dispose` — release resources

The framework calls this when `configurator.dispose(instance)` is called. If you extend `BaseModuleProvider` and add subscriptions to `this.subscription`, you do not need to do anything extra — `dispose()` calls `this.subscription.unsubscribe()` automatically:

```typescript
dispose: async ({ instance }) => {
  // BaseModuleProvider.dispose() handles this.subscription automatically.
  // Only add this hook if you have additional teardown logic.
  await instance.closeConnections();
},
```

---

## Complete example

```typescript
import {
  type Module,
  BaseConfigBuilder,
  type ConfigBuilderCallback,
} from '@equinor/fusion-framework-module';
import {
  BaseModuleProvider,
  type BaseModuleProviderCtorArgs,
} from '@equinor/fusion-framework-module/provider';
import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

interface GreeterConfig {
  greeting: string;
  punctuation: string;
}

class GreeterConfigurator extends BaseConfigBuilder<GreeterConfig> {
  setGreeting(cb: ConfigBuilderCallback<string>): void {
    this._set('greeting', cb);
  }
  setPunctuation(cb: ConfigBuilderCallback<string>): void {
    this._set('punctuation', cb);
  }
}

class GreeterProvider extends BaseModuleProvider {
  readonly #greeting: string;
  readonly #punctuation: string;

  constructor(args: BaseModuleProviderCtorArgs & { config: GreeterConfig }) {
    super(args);
    this.#greeting = args.config.greeting;
    this.#punctuation = args.config.punctuation;
  }

  greet(name: string): string {
    return `${this.#greeting}, ${name}${this.#punctuation}`;
  }
}

export type GreeterModule = Module<'greeter', GreeterProvider, GreeterConfigurator>;

export const greeterModule: GreeterModule = {
  name: 'greeter',
  configure: () => {
    const builder = new GreeterConfigurator();
    builder.setGreeting(() => 'Hello');
    builder.setPunctuation(() => '!');
    return builder;
  },
  initialize: async ({ config }) => {
    const resolved = await config.createConfigAsync({
      config: {},
      hasModule: () => false,
      requireInstance: async () => { throw new Error('no modules'); },
    });
    return new GreeterProvider({ version: '1.0.0', config: resolved });
  },
};

export function enableGreeter(
  configurator: IModulesConfigurator<any, any>,
  configure?: (builder: GreeterConfigurator) => void,
): void {
  configurator.addConfig({ module: greeterModule, configure });
}
```

---

## Next Steps

- [Configuration](./configuration.md) — deep dive into `BaseConfigBuilder` and config callbacks
- [Cross-Module Dependencies](./cross-module-deps.md) — `requireInstance` and `postInitialize` patterns
- [Common Mistakes](./common-mistakes.md) — pitfalls to avoid when authoring modules

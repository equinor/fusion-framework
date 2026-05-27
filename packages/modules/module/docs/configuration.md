# Configuration — @equinor/fusion-framework-module

This document explains how module configuration works in Fusion Framework: how `BaseConfigBuilder` collects and resolves consumer callbacks, how defaults interact with overrides, and patterns for writing clean configurators.

## The Configuration Flow

Every module that accepts consumer configuration exports a **config builder** — a subclass of `BaseConfigBuilder`. The lifecycle runs in this order:

1. `module.configure()` creates a fresh `ConfigBuilder`
2. The consumer's `configure` callback calls setter methods on it
3. `module.postConfigure()` applies any cross-module defaults
4. The framework calls `createConfigAsync()` to resolve all callbacks
5. The resolved config object is passed to `initialize()`

The consumer never sees the resolved config directly. They only ever interact with the config builder. The resolved config is internal to the module.

## BaseConfigBuilder

`BaseConfigBuilder<TConfig>` is the abstract base for all config builders. It is generic over `TConfig` — the plain object type the module reads at initialize time.

Internally, `BaseConfigBuilder` maintains a registry of dot-path keys mapped to callback arrays. When `createConfigAsync` is called, it runs all registered callbacks in order, resolves any promises, and merges the results into a single `TConfig` object.

```typescript
import { BaseConfigBuilder, type ConfigBuilderCallback } from '@equinor/fusion-framework-module';

interface HttpConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

class HttpConfigurator extends BaseConfigBuilder<HttpConfig> {
  setBaseUrl(cb: ConfigBuilderCallback<string>): void {
    this._set('baseUrl', cb);
  }

  setTimeout(cb: ConfigBuilderCallback<number>): void {
    this._set('timeout', cb);
  }

  addDefaultHeader(name: string, cb: ConfigBuilderCallback<string>): void {
    // Dot-path keys allow targeting nested properties.
    this._set(`defaultHeaders.${name}`, cb);
  }
}
```

### `_set(key, callback)`

`_set` is the only method you need in a config builder subclass. It:

- Accepts a dot-path string (e.g. `'baseUrl'`, `'auth.clientId'`) and a `ConfigBuilderCallback`.
- Registers the callback in the internal pipeline for that key.
- **Appends** — calling `_set` twice for the same key means the second callback's return value wins (last-write-wins within a single builder).

### ConfigBuilderCallback

A `ConfigBuilderCallback<T>` is a function with the signature:

```typescript
type ConfigBuilderCallback<T> = (
  args: ConfigBuilderCallbackArgs,
) => T | Promise<T>;
```

`ConfigBuilderCallbackArgs` gives the callback access to:

- `config` — the partial config object built so far (can inspect previously set keys)
- `hasModule(name)` — check if a given module is registered
- `requireInstance(name)` — await a live provider at config time (use sparingly)
- `ref` — the reference object passed to `initialize(ref?)`

Most callbacks just return a static value. The async capability is there for cases where you need to fetch a value from a server or await a provider before config resolves.

```typescript
// Simple static value
builder.setBaseUrl(() => 'https://api.example.com');

// Async — fetches value at config time
builder.setBaseUrl(async () => {
  const res = await fetch('/api/config');
  return (await res.json()).baseUrl;
});

// Reads another key already set on this config
builder.setTimeout(({ config }) => {
  return config.baseUrl?.includes('localhost') ? 60_000 : 5_000;
});
```

---

## Setting Defaults

Set defaults inside `module.configure()`, before the consumer's callback runs. This way the consumer only needs to call a setter if they want to override the default — no `||` fallbacks or special "unset" sentinels:

```typescript
export const httpModule: HttpModule = {
  name: 'http',
  configure: () => {
    const builder = new HttpConfigurator();
    // These run before any consumer configure callback.
    builder.setBaseUrl(() => '/');
    builder.setTimeout(() => 10_000);
    return builder;
  },
  initialize: async ({ config }) => { /* … */ },
};
```

If the consumer calls `builder.setBaseUrl(() => 'https://api.example.com')`, their callback runs after the default and its return value wins.

---

## Reading Config in initialize

`module.initialize` receives the fully resolved config via `config.createConfigAsync(args)`. You call this once and destructure what you need:

```typescript
initialize: async ({ config, requireInstance, hasModule, ref }) => {
  const resolved = await config.createConfigAsync({
    config: {},
    hasModule,
    requireInstance,
    ref,
  });

  // resolved is typed as HttpConfig — full autocomplete, no casting.
  return new HttpClient({
    baseUrl: resolved.baseUrl,
    timeout: resolved.timeout,
    defaultHeaders: resolved.defaultHeaders,
  });
},
```

Pass the `hasModule` and `requireInstance` functions through so that callbacks that need them (like async ones that fetch a peer provider) work correctly.

---

## Patterns

### Guarded defaults from peer modules

Sometimes you want a default that depends on whether another module is present. Use `hasModule` inside the default callback:

```typescript
configure: () => {
  const builder = new HttpConfigurator();
  builder.setBaseUrl(async ({ hasModule, requireInstance }) => {
    if (hasModule('serviceDiscovery')) {
      const discovery = await requireInstance('serviceDiscovery');
      return discovery.resolveUrl('api');
    }
    return '/';
  });
  return builder;
},
```

### Exposing builder methods on an enable function

When you ship an `enableXxx` function, expose the common setters as direct parameters to avoid making consumers import the builder type just to call one method:

```typescript
export function enableHttp(
  configurator: IModulesConfigurator<any, any>,
  options?: {
    baseUrl?: string;
    timeout?: number;
  },
): void {
  configurator.addConfig({
    module: httpModule,
    configure: (builder) => {
      if (options?.baseUrl) builder.setBaseUrl(() => options.baseUrl!);
      if (options?.timeout) builder.setTimeout(() => options.timeout!);
    },
  });
}
```

### Separating public and private configuration

If your module has config that should only be set by the module itself (not by consumers), do not expose a setter for it. Set it directly in `module.configure()` or `module.postConfigure()`. The builder is just an object — you are not forced to expose every key.

---

## Next Steps

- [Authoring Modules](./authoring-modules.md) — full step-by-step guide
- [Cross-Module Dependencies](./cross-module-deps.md) — using `requireInstance` inside config callbacks
- [Common Mistakes](./common-mistakes.md) — pitfalls with configuration

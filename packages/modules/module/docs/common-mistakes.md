# Common Mistakes — @equinor/fusion-framework-module

A collection of mistakes that come up repeatedly when authoring or consuming modules. Each entry explains what goes wrong, why, and the correct approach.

---

## 1. Accessing `modules` inside `initialize`

**Wrong**
```typescript
initialize: async ({ config }) => {
  const auth = modules.auth; // ❌ modules doesn't exist here
  return new MyProvider(config, auth);
},
```

**Why it breaks:** `initialize` runs concurrently with all other modules. There is no `modules` map yet. The variable `modules` would be `undefined` or would reference the stale map from a previous run.

**Correct:** Use `requireInstance` for construction-time dependencies, or move the wiring to `postInitialize`.

```typescript
initialize: async ({ config, requireInstance, hasModule }) => {
  const resolved = await config.createConfigAsync({ config: {}, hasModule, requireInstance });
  const auth = await requireInstance('auth', 5_000); // ✓
  return new MyProvider(resolved, auth);
},
```

---

## 2. Forgetting `await` on `requireInstance`

**Wrong**
```typescript
initialize: async ({ config, requireInstance }) => {
  const auth = requireInstance('auth', 5_000); // ❌ missing await
  return new MyProvider(config, auth); // auth is a Promise, not a provider
},
```

**Why it breaks:** `requireInstance` returns a `Promise`. Without `await`, the provider receives a Promise object instead of the resolved provider instance. This typically causes a null-pointer or a "not a function" error at runtime, often in a place far removed from the initialization code.

**Correct:**
```typescript
const auth = await requireInstance('auth', 5_000); // ✓
```

---

## 3. Circular `requireInstance` calls

**Wrong**
```typescript
// Module A
initialize: async ({ requireInstance }) => {
  const b = await requireInstance('b'); // ❌ waits for B
  return new ProviderA(b);
},

// Module B
initialize: async ({ requireInstance }) => {
  const a = await requireInstance('a'); // ❌ waits for A
  return new ProviderB(a);
},
```

**Why it breaks:** A waits for B. B waits for A. Both promises hang forever — a classic deadlock. The framework does not detect or break cycles.

**Correct:** Break the cycle by moving one direction of the wiring to `postInitialize`. By that point, both providers exist:

```typescript
// Module A — constructs without B
initialize: async ({ config }) => new ProviderA(config),

// Module B — constructs with A's provider
initialize: async ({ requireInstance, config }) => {
  const a = await requireInstance('a', 5_000); // ✓ A initializes without waiting
  return new ProviderB(config, a);
},

// Wire B back into A after everything is ready
// Option 1: in A's postInitialize
postInitialize: async ({ instance, modules }) => {
  instance.setB(modules.b); // ✓ inject lazily
},
```

---

## 4. Heavy async work in `configure`

**Wrong**
```typescript
configure: async (ref) => {
  const builder = new MyConfigurator();
  const data = await fetch('/api/slow-config'); // ❌ blocks configure phase for all modules
  builder.setData(() => data.json());
  return builder;
},
```

**Why it breaks:** The framework awaits every module's `configure()` factory sequentially before starting consumer callbacks. Heavy async work here serialises the configure phase across all modules and slows down startup for everyone.

**Correct:** Move the async work into the `ConfigBuilderCallback` itself (runs after all configure factories) or into `initialize` (where it runs concurrently):

```typescript
configure: () => {
  const builder = new MyConfigurator();
  builder.setData(async () => {
    const res = await fetch('/api/slow-config'); // ✓ runs in the callback phase
    return res.json();
  });
  return builder; // synchronous factory
},
```

---

## 5. Cross-module wiring in `initialize` instead of `postInitialize`

**Wrong**
```typescript
initialize: async ({ requireInstance }) => {
  const event = await requireInstance('event', 5_000);
  const provider = new MyProvider();

  // Subscribing here works, but if 'event' finishes before other modules,
  // you are wiring to a live stream while other modules are still initializing.
  // Prefer postInitialize for any multi-module reactive wiring.
  event.on('contextChanged', (ctx) => provider.update(ctx)); // ⚠ premature wiring
  return provider;
},
```

**Correct:** Use `postInitialize` so all modules are stable before you wire their event streams together:

```typescript
initialize: async ({ config }) => new MyProvider(config),

postInitialize: async ({ instance, modules }) => {
  modules.event.on('contextChanged', (ctx) => instance.update(ctx)); // ✓
},
```

---

## 6. Not adding subscriptions to `this.subscription`

**Wrong**
```typescript
class MyProvider extends BaseModuleProvider {
  constructor(args: BaseModuleProviderCtorArgs) {
    super(args);
    someObservable$.subscribe((v) => this.handle(v)); // ❌ leaked subscription
  }
}
```

**Why it breaks:** When `dispose()` is called, the subscription is not cancelled. The callback continues running on a disposed provider, potentially causing memory leaks, stale state updates, or errors.

**Correct:** Always add subscriptions to `this.subscription`:

```typescript
class MyProvider extends BaseModuleProvider {
  constructor(args: BaseModuleProviderCtorArgs) {
    super(args);
    this.subscription.add( // ✓ cancelled automatically on dispose()
      someObservable$.subscribe((v) => this.handle(v)),
    );
  }
}
```

---

## 7. Registering the same module object twice expecting additive config

**Wrong**
```typescript
configurator.addConfig({ module: httpModule, configure: (b) => b.setBaseUrl(() => '/default') });
configurator.addConfig({ module: httpModule, configure: (b) => b.setBaseUrl(() => '/override') }); // second addConfig replaces the first
```

**Why it bites you:** The second `addConfig` call for the same module replaces the first registration entirely — including its `configure` callback. If you intended both callbacks to run (for example, to layer defaults and then consumer overrides), only the last one does.

**Correct:** If you need multiple configure callbacks for the same module, chain them in a single `configure` function or use `postConfigure`. If you genuinely need two independent instances, create two separate module objects with different `name` values.

---

## 8. Accessing `modules` in a consumer's `onConfigured` callback

**Wrong**
```typescript
configurator.onConfigured((configMap) => {
  const provider = modules.http; // ❌ modules doesn't exist yet — onConfigured runs before initialize
  provider.setDefaultHeader('X-Config', configMap.http.someValue);
});
```

**Why it breaks:** `onConfigured` runs at the end of the configure phase, before any module has initialized. `modules` is not available.

**Correct:** Use `onInitialized` for wiring that needs live providers, or use `addConfig({ afterInit })` for per-module post-init wiring.

```typescript
configurator.onInitialized((modules) => {
  modules.http.setDefaultHeader('X-Config', 'value'); // ✓ providers are ready
});
```

---

## Next Steps

- [Lifecycle](./lifecycle.md) — understand what is available at each phase
- [Cross-Module Dependencies](./cross-module-deps.md) — correct patterns for peer dependencies
- [Authoring Modules](./authoring-modules.md) — full guide to writing a module

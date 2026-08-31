---
"@equinor/fusion-framework-module-event": minor
---

Add `EventModuleConfigurator`, a `BaseConfigBuilder`-based configurator with fluent
`setOnDispatch`/`setOnBubble` setters, replacing direct property assignment on the config
object.

```ts
// Before (still works, but deprecated)
config.event.onDispatch = (event) => { ... };
delete config.event.onBubble;

// After
configurator.setOnDispatch((event) => { ... });
configurator.setOnBubble(undefined);
```

`IEventModuleConfigurator` is renamed to `EventModuleConfig` and converted from an `interface`
to a `type`. `IEventModuleConfigurator` is kept as a deprecated type alias for backward
compatibility.

Also narrows the `dispatchEvent` return type for registered {@link FrameworkEventMap} keys and
pre-constructed event instances, so callers get back the specific event type instead of the
generic `FrameworkEvent`.

**Deprecated (since 6.1.0), no migration required yet:**
- `EventModuleConfigurator#onDispatch`/`#onBubble` property assignment — use `setOnDispatch`/`setOnBubble`.
- `IEventModuleConfigurator` type — use `EventModuleConfig`.

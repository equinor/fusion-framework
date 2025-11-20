---
"@equinor/fusion-framework-module-telemetry": minor
---

Refactor telemetry filtering API to use a unified `setFilter` method instead of separate `setAdapterFilter` and `setRelayFilter` methods.

**Changes**

- Added unified `setFilter()` method that accepts a filter object
- Config changed from `adapterFilter`/`relayFilter` to a single `filter` object
- The new API provides a cleaner, more cohesive interface for configuring both adapter and relay filters together

**Usage**

```typescript
builder.setFilter({
  adapter: (item) => item.type === TelemetryType.Exception,
  relay: (item) => item.scope?.includes('critical')
});
```


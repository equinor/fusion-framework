---
"@equinor/fusion-framework-module-telemetry": minor
---

Add filtering options for telemetry messages passed from provider to adapters and parent providers.

**New Features**

- **`setAdapterFilter`**: Filter which telemetry items are passed to adapters
- **`setRelayFilter`**: Filter which telemetry items are relayed to parent providers

**Usage**

```typescript
enableTelemetry(configurator, {
  configure: (builder) => {
    // Only send exceptions to adapters
    builder.setAdapterFilter((item) => item.type === TelemetryType.Exception);
    
    // Only relay important events to parent provider
    builder.setRelayFilter((item) => 
      item.type === TelemetryType.Exception || 
      item.scope?.includes('critical')
    );
  }
});
```

**Hierarchical Filtering**

This feature enables filtering at each level of hierarchical telemetry setups (bootstrap → portal → apps), allowing:
- Portal instances to filter which events reach bootstrap adapters
- App instances to filter which events reach portal providers
- Performance optimization by filtering unnecessary telemetry before processing
- Privacy control by preventing sensitive telemetry from flowing up the hierarchy

**Backward Compatibility**

Existing code continues to work without filters - all items pass through by default when no filters are configured.

Closes: https://github.com/equinor/fusion-framework/issues/3774


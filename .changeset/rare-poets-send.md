---
"portal-analytics": minor
"@equinor/fusion-framework-module-analytics": major
---

`ContextSelectedCollector` now accepts an `AppModuleProvider` as a second
constructor argument and includes the currently active application key
(`appKey`) in the event attributes.

This allows analytics consumers to correlate context-change events with the app
that was active when the context switch occurred.

**Breaking change for direct users of `ContextSelectedCollector`:** the
constructor now requires a second argument:

```typescript
// Before
new ContextSelectedCollector(contextProvider);
// After
new ContextSelectedCollector(contextProvider, appProvider);
```

The emitted event attributes schema is extended accordingly:

```typescript
// attributes shape
{
  previous: ContextMetadata | null | undefined;
  appKey?: string; // newly added — the appKey of the active app at the time of the context change
}
```

---
"@equinor/fusion-framework-module-event": patch
---

## @equinor/fusion-event

### Improved Type Resolution for `FrameworkEventInitType`

The `FrameworkEventInitType` type has been enhanced to better resolve types for both `IFrameworkEvent` and `FrameworkEvent`.

When defining events `FrameworkEventMap`, the dispatch type can now be inferred from the event type.

#### Changes

The type definition for `FrameworkEventInitType` has been updated as follows:

```typescript
export type FrameworkEventInitType<T> =
    T extends IFrameworkEvent<infer U> ? U : T extends FrameworkEvent<infer U> ? U : never;
```

This change ensures that `FrameworkEventInitType` can now correctly infer the type for both `IFrameworkEvent` and `FrameworkEvent`.
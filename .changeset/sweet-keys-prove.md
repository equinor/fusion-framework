---
'@equinor/fusion-framework-legacy-interopt': patch
---

#### Updated Files:

- `packages/react/legacy-interopt/src/create-fusion-context.ts`
- `packages/react/legacy-interopt/src/create-service-resolver.ts`

#### Changes:

1. **create-fusion-context.ts**
   - Added a call to `authContainer.handleWindowCallbackAsync()` before initializing `TelemetryLogger`.

```ts
const authContainer = new LegacyAuthContainer({ auth: framework.modules.auth });

await authContainer.handleWindowCallbackAsync();

const telemetryLogger = new TelemetryLogger(telemetry?.instrumentationKey ?? '', authContainer);
```

2. **create-service-resolver.ts**
   - Changed the third parameter of authContainer.registerAppAsync from false to true.
  
```ts
return authContainer.registerAppAsync(
    id,
    uris.map((x) => x.uri),
    true,
);
```

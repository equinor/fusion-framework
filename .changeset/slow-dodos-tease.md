---
'@equinor/fusion-framework-legacy-interopt': patch
---

#### Updated Files:
- `packages/react/legacy-interopt/src/create-fusion-context.ts`
- `packages/react/legacy-interopt/src/create-service-resolver.ts`

#### Changes:

1. **create-fusion-context.ts**
   - Added a call to `authContainer.handleWindowCallbackAsync()` before initializing `TelemetryLogger`.

2. **create-service-resolver.ts**

   - Changed the third parameter of authContainer.registerAppAsync from false to true.

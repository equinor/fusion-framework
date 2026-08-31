---
"@equinor/fusion-framework-module-ag-grid": minor
---

Add `suppressAgGridLicenseBanner`, a test helper exported from a new `/testing` subpath (`@equinor/fusion-framework-module-ag-grid/testing`).

Without a license key, AG Grid Enterprise logs a "License Key Not Found" banner through `console.error` on every grid mount — expected in tests, but it buries real assertion failures in the reporter output. Applications previously had to hand-roll a `console.error` filter in their own test setup file to work around this; that logic now lives here instead.

```typescript
// src/test/setupTests.ts
import { suppressAgGridLicenseBanner } from '@equinor/fusion-framework-module-ag-grid/testing';

suppressAgGridLicenseBanner();
```

The helper only filters the license banner and passes every other `console.error` call through unchanged. It returns a function to restore the original `console.error`. To remove the banner from a running application (not just tests), configure a real license key via `enableAgGrid`/`setLicenseKey` instead.

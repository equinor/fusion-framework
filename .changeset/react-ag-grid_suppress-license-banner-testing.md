---
"@equinor/fusion-framework-react-ag-grid": minor
---

Re-export `suppressAgGridLicenseBanner` from a new `/testing` subpath (`@equinor/fusion-framework-react-ag-grid/testing`), forwarding to `@equinor/fusion-framework-module-ag-grid/testing`.

```typescript
// src/test/setupTests.ts
import { suppressAgGridLicenseBanner } from '@equinor/fusion-framework-react-ag-grid/testing';

suppressAgGridLicenseBanner();
```

Apps already depending on `@equinor/fusion-framework-react-ag-grid` no longer need a direct dependency on `@equinor/fusion-framework-module-ag-grid` just to reach this test helper.

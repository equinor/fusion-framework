---
"@equinor/fusion-framework-module-http": patch
---

Internal: resolve remaining `fusion-lint` warnings across the module (TSDoc, intent comments, `no-todo-without-issue`). Also reorganizes the error classes into `src/errors/` (one class per file, `HttpResponseError.ts`, `HttpJsonResponseError.ts`, `ServerSentEventResponseError.ts`, `ClientNotFoundException.ts`) and exposes them as a namespace:

```typescript
// Before
import { ClientNotFoundException } from '@equinor/fusion-framework-module-http';

// After
import { Errors } from '@equinor/fusion-framework-module-http';
new Errors.ClientNotFoundException(...);
```

The `./errors` subpath export now resolves to `dist/esm/errors/index.js` / `dist/types/errors/index.d.ts`. No behavior change.

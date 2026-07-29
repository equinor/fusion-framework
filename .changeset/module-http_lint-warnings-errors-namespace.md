---
"@equinor/fusion-framework-module-http": patch
---

Internal: resolve remaining `fusion-lint` warnings across the module (TSDoc, intent comments, `no-todo-without-issue`). Also reorganizes the error classes into `src/errors/` (one class per file, `HttpResponseError.ts`, `HttpJsonResponseError.ts`, `ServerSentEventResponseError.ts`, `ClientNotFoundException.ts`) and additionally exposes them as an `Errors` namespace:

```typescript
// Still works, unchanged
import { ClientNotFoundException } from '@equinor/fusion-framework-module-http';

// New alternative
import { Errors } from '@equinor/fusion-framework-module-http';
new Errors.ClientNotFoundException(...);
```

The existing named exports and the `./errors` subpath export (`dist/esm/errors/index.js` / `dist/types/errors/index.d.ts`) both continue to work — no breaking change for consumers.

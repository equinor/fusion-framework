---
"@equinor/fusion-observable": minor
---

Add `actions` export path to observable package for better tree-shaking.

The `actions` types and utilities are now available via a dedicated export path:

```typescript
// New export path
import type { Action, ActionTypes } from '@equinor/fusion-observable/actions';
```

This provides better tree-shaking support when only action types are needed.


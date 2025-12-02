---
"@equinor/fusion-framework-module-feature-flag": major
---

Remove local `Path` type export from feature-flag module; now uses `Path` type from `@equinor/fusion-framework-module-navigation`.

**Breaking Change**: The `Path` type is no longer exported from `@equinor/fusion-framework-module-feature-flag/plugins/url`. If you were importing `Path` from the feature-flag module, update your imports to use `Path` from the navigation module instead:

```typescript
// Before
import type { Path } from '@equinor/fusion-framework-module-feature-flag/plugins/url';

// After
import type { Path } from '@equinor/fusion-framework-module-navigation';
```

This change ensures type consistency across modules and aligns with the navigation module's React Router v7 upgrade.


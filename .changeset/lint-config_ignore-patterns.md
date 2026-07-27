---
"@equinor/fusion-framework-lint-config": minor
"@equinor/fusion-lint": minor
---

Add `ignorePatterns` config option to exclude files/directories from linting entirely, independent of `.gitignore`.

```typescript
// fusion-lint.config.ts
import { defineConfig } from '@equinor/fusion-framework-lint-config';

export default defineConfig({
  ignorePatterns: ['**/__tests__/**'],
});
```

Also available on the builder form via `builder.ignorePatterns = [...]`. Both the `fusion-lint lint` and `fusion-lint changed` CLI commands now honor this option.

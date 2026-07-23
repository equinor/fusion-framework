---
"@equinor/fusion-framework-lint-core": minor
---

Initial release of `@equinor/fusion-framework-lint-core`.

Provides the foundational engine, rule interface, and diagnostic types for the Fusion Framework linting system.

```typescript
import { LintEngine } from '@equinor/fusion-framework-lint-core';

const engine = new LintEngine(config);
const diagnostics = engine.lint(sourceText, filePath);
```

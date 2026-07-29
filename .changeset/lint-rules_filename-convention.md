---
"@equinor/fusion-framework-lint-rules": minor
---

Add a `filenameConvention` rule that checks a file's name against the naming convention of its single top-level export: classes and PascalCase-named components must be named after the export exactly, hooks (`useXxx`) must match the hook name exactly, and everything else must be kebab-case. A trailing dotted category suffix is allowed for the kebab-case case (e.g. `my-foo.schema.ts`, `sse.operator.ts`) — only the segment before the first dot needs to match. Files with zero or more than one top-level value export are skipped, and `index.*`/`*.d.ts` files are exempt by default.

```typescript
import { filenameConvention } from '@equinor/fusion-framework-lint-rules';

const rule = filenameConvention();
```

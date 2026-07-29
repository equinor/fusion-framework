---
"@equinor/fusion-framework-lint-core": major
---

`Rule.check` now takes a single `ctx: LintContext` argument instead of separate `filePath`/`severity` parameters, and a new `RuleDef`/`resolveMatch`/`RuleOptions` factory API is exported for building configurable rules.

```typescript
// Before
const myRule: Rule = {
  id: 'my-rule',
  defaultSeverity: 'warn',
  check(source, filePath, severity) {
    return [];
  },
};

// After
import type { LintContext } from '@equinor/fusion-framework-lint-core';

const myRule: Rule = {
  id: 'my-rule',
  defaultSeverity: 'warn',
  check(source, ctx: LintContext) {
    // ctx.filePath, ctx.severity
    return [];
  },
};
```

Also adds `LintContext`, `RuleDef`, `RuleOptions`, `RuleMatchOptions`, and `resolveMatch` — a factory-friendly way for rules to build their default `match` while still honoring a caller-supplied `options.match` override.

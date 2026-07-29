# @equinor/fusion-framework-lint-rules

Fusion-specific lint rules powered by [tree-sitter](https://tree-sitter.github.io/tree-sitter/).

## Rules

### `require-intent-comment` (default: `warn`)

Every control-flow statement (`if`, `for`, `while`, `do`, `switch`, `for...of`, `for...in`) and
iterator call (`forEach`, `map`, `filter`, …) must be immediately preceded by a comment that explains
**why** the branch or loop exists — not what it does.

**Why?** Intent comments force authors (human or AI) to commit to a rationale in the diff.
Reviewers get a falsifiable claim, not just observable behaviour.

**Failing:**
```typescript
if (user.isAuthenticated) {
  redirect('/dashboard');
}
```

**Passing:**
```typescript
// Unauthenticated users must complete onboarding before accessing the dashboard
if (user.isAuthenticated) {
  redirect('/dashboard');
}
```

## Extending

Every rule module exports a `RuleDef` factory — a function that accepts an optional `options`
object (including a uniform `options.match` for overriding which files the rule applies to) and
returns a configured `Rule`. Call the factory (even with no arguments) to get a usable `Rule`
instance:

```typescript
import type { Diagnostic, RuleDef } from '@equinor/fusion-framework-lint-core';
import { resolveMatch } from '@equinor/fusion-framework-lint-core';

export const myRule: RuleDef = (options = {}) => ({
  id: 'my-rule',
  defaultSeverity: 'warn',
  match: resolveMatch(options.match),
  check(source, ctx) {
    return [];
  },
});

// usage
import { myRule } from './my-rule/index.js';
const rule = myRule({ match: { exclude: ['*.generated.ts'] } });
```

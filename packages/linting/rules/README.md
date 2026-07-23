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

Implement the `Rule` interface from `@equinor/fusion-framework-lint-core` and add your rule to the exports:

```typescript
import type { Rule } from '@equinor/fusion-framework-lint-core';

export const myRule: Rule = {
  id: 'my-rule',
  defaultSeverity: 'warn',
  check(source, filePath) {
    return [];
  },
};
```

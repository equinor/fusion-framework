# @equinor/fusion-framework-lint-core

Core types and lint engine for Fusion Framework linting tools.

## Overview

This package provides the foundational building blocks for the Fusion lint system:

- **`Diagnostic`** — a single lint finding with file, line, col, rule, message, and severity.
- **`Rule`** — interface that all lint rules implement.
- **`LintEngine`** — orchestrates rule execution and applies per-rule severity config.

## Usage

```typescript
import { LintEngine } from '@equinor/fusion-framework-lint-core';
import type { Rule } from '@equinor/fusion-framework-lint-core';

const myRule: Rule = {
  id: 'my-rule',
  defaultSeverity: 'warn',
  check(source, filePath) {
    // return Diagnostic[]
    return [];
  },
};

const engine = new LintEngine([myRule], { 'my-rule': 'error' });
const diagnostics = engine.lint(source, filePath);
```

## Config

The `LintConfig` type is a flat `Record<rule-id, 'off' | 'warn' | 'error'>`.
`'off'` disables the rule. `'warn'` and `'error'` override the rule's `defaultSeverity`.

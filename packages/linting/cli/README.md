# @equinor/fusion-lint

CLI for running Fusion lint rules on TypeScript source files.

## Installation

```bash
pnpm add -D @equinor/fusion-lint
```

## Usage

```bash
# Lint all TypeScript files under src/
fusion-lint "src/**/*.ts"

# Lint TSX files too
fusion-lint "src/**/*.{ts,tsx}"

# Emit GitHub Actions inline annotations (auto-detected from $GITHUB_ACTIONS)
fusion-lint --github-actions "src/**/*.ts"
```

Exit code `0` when all diagnostics are `warn`. Exit code `1` when any diagnostic is `error`.

## Programmatic API

```typescript
import { LintEngine, recommendedRules, recommendedConfig } from '@equinor/fusion-lint';

const engine = new LintEngine(recommendedRules, {
  ...recommendedConfig,
  'require-intent-comment': 'error',
});

const diagnostics = engine.lint(source, filePath);
```

## GitHub Actions

```yaml
- name: Fusion lint
  run: pnpm fusion-lint "src/**/*.ts"
  env:
    GITHUB_ACTIONS: 'true'
```

Diagnostics appear as inline annotations on the PR diff.

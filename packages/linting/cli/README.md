# @equinor/fusion-lint

Command-line interface for [Fusion Lint](../README.md) — runs the same tree-sitter based
lint rules used by the VS Code extension against TypeScript source files from the terminal
or CI. No project config is required: `fusion-lint` ships with `recommendedRules` and
`recommendedConfig` from `@equinor/fusion-framework-lint-config` baked in.

## When to use this package

- You want lint diagnostics in a terminal, pre-commit hook, or CI pipeline without an editor.
- You want GitHub Actions inline annotations (`::warning` / `::error`) on a pull request diff.
- You want a machine-readable report (`json` or `rdjsonl`) for an AI agent, reviewdog, or another tool to consume.
- You only want to lint files that changed in git, instead of a whole package or directory.

For editor integration, see the [VS Code extension](../vscode/). For the rule catalogue, see [`@equinor/fusion-framework-lint-rules`](../rules/).

## Installation

```bash
pnpm add -D @equinor/fusion-lint
```

## Quick start

```bash
# Lint all supported TypeScript files under src/ (recursively)
fusion-lint src

# Lint a specific package
fusion-lint packages/modules/http

# Glob patterns and individual files also work
fusion-lint "src/**/*.{ts,tsx}"
```

`fusion-lint` is shorthand for `fusion-lint lint` — `lint` is the default command, so the
sub-command name can be omitted.

## Commands

The CLI exposes two commands:

| Command | Use it for |
|---|---|
| `fusion-lint lint <patterns...>` (default) | Linting an explicit set of files, directories, or globs |
| `fusion-lint changed` | Linting only files that changed in git — pre-commit hooks, PR CI |

### `lint` — file, directory, and glob patterns

`<patterns...>` accepts any mix of:

- **Directories** — expanded recursively to every supported file inside, e.g. `fusion-lint packages/modules/http`
- **Glob patterns** — passed straight through, e.g. `fusion-lint "src/**/*.{ts,tsx}"`
- **Individual files** — e.g. `fusion-lint src/index.ts`

Supported extensions: `.ts`, `.tsx`, `.mts`, `.cts` (`.d.ts` files are always skipped).
`node_modules` is always excluded.

`.gitignore` is respected by default, so build output and other ignored paths are skipped
automatically. Pass `--skip-gitignore` to lint ignored files too:

```bash
fusion-lint src --skip-gitignore
```

### `changed` — lint only git-changed files

```bash
# All uncommitted changes vs HEAD (staged + unstaged + untracked, default)
fusion-lint changed

# Only staged files — ideal for a pre-commit hook
fusion-lint changed --staged

# Everything changed since a ref — ideal for PR CI checks
fusion-lint changed --against origin/main
```

`changed` only considers `.ts`/`.tsx`/`.mts`/`.cts` files and always excludes files git
itself ignores (`git ls-files --exclude-standard`), so it has no `--skip-gitignore` flag.

## Rule configuration

Both commands start from the curated `recommendedRules` + `recommendedConfig` from
[`@equinor/fusion-framework-lint-config`](../config/), then layer in a project config file if
one is found. Severity resolution, lowest to highest precedence:

1. `recommendedConfig` / `recommendedRules`
2. A `fusion-lint.config.*` / `.fusion-lintrc.*` file, resolved by searching from the current
   working directory upward through parent directories until one is found or the repository
   root (the directory containing `.git`) has been checked — so a single config at your
   monorepo root applies to every package without duplicating it
3. `--rule <id>=<severity>` overrides, which always win

```bash
fusion-lint src --rule require-intent-comment=error --rule require-tsdoc=off
```

See [`@equinor/fusion-framework-lint-config`](../config/) for the supported config file
formats (flat severity maps, rich `{ rules, customRules }` objects, and factory-style
`defineConfig` builders).

## Reporters

Select the output format with `--reporter <name>` (default `pretty`):

| Reporter | Output |
|---|---|
| `pretty` | Coloured, human-readable terminal output |
| `github-actions` | `::warning` / `::error` workflow annotations (also auto-detected from `--github-actions` or the `GITHUB_ACTIONS` env var) |
| `rdjsonl` | [reviewdog](https://github.com/reviewdog/reviewdog) NDJSON — pipe into `reviewdog -f=rdjsonl` |
| `json` | Single JSON report, always exits `0` — for AI agents and tooling; combine with `--output <file>` to write to disk |

Other flags:

- `--diagnostic-level <level>` — `warn` (default) or `error` to suppress warnings entirely
- `--verbose` — show extended diagnostic descriptions instead of terse rule IDs (`pretty` reporter only)

## Exit codes

Exit code `0` when all diagnostics are `warn` (or there are none). Exit code `1` when any
diagnostic is `error`. The `json` reporter always exits `0`, since it's a report rather than
a gate — safe to run on draft PRs without failing the job.

## GitHub Actions

```yaml
- name: Fusion lint
  run: pnpm fusion-lint src
  env:
    GITHUB_ACTIONS: 'true'
```

Diagnostics appear as inline annotations on the PR diff.

## Pre-commit hook

```bash
fusion-lint changed --staged --diagnostic-level=error
```

## Programmatic API

`createLintCommand` and `createChangedCommand` return composable `commander` commands, so
you can embed `fusion-lint` inside another CLI (e.g. Fusion's `ffc`):

```typescript
import { createLintCommand, createChangedCommand } from '@equinor/fusion-lint';

appCommand.addCommand(createLintCommand());
appCommand.addCommand(createChangedCommand());
// → ffc app lint packages/modules/http
// → ffc app changed --staged
```

The package also re-exports the underlying lint engine and config, for callers that want to
build their own tool on top rather than shell out to the CLI:

```typescript
import { LintEngine, recommendedRules, recommendedConfig } from '@equinor/fusion-lint';

const engine = new LintEngine(recommendedRules, {
  ...recommendedConfig,
  'require-intent-comment': 'error',
});

const diagnostics = engine.lint(source, filePath);
```

`Diagnostic`, `Rule`, `Severity`, and `LintConfig` types, plus the `formatAnnotations` /
`formatPretty` / `formatSummary` formatters, are also exported for reuse.


# @equinor/fusion-framework-lint-config

Recommended Fusion lint configuration — a curated set of rules, default severities, a config-file loader, and a fluent `ConfigBuilder` API for extending the linter with custom rules.

## When to use this package

- You want the recommended rule preset with the engine in `@equinor/fusion-framework-lint-core`.
- You want to load and resolve a project-level config file (`fusion-lint.config.ts`, `.fusion-lintrc.json`, etc.).
- You want a `defineConfig` helper for type-safe config files.
- You want to register custom rules or adjust built-in severities programmatically.

## Quick start

```typescript
import { LintEngine } from '@equinor/fusion-framework-lint-core';
import { recommendedRules, recommendedConfig } from '@equinor/fusion-framework-lint-config';

const engine = new LintEngine(recommendedRules, recommendedConfig);
const diagnostics = engine.lint(source, filePath);
```

## Config files

`loadLintConfig` searches the working directory for a config file and resolves it into a `LoadedLintConfig` containing merged severity config and any custom rules.

```typescript
import { loadLintConfig, recommendedRules, recommendedConfig } from '@equinor/fusion-framework-lint-config';
import { LintEngine } from '@equinor/fusion-framework-lint-core';

const loaded = await loadLintConfig({ base: recommendedConfig });

if (loaded) {
  const engine = new LintEngine(
    [...recommendedRules, ...loaded.customRules],
    loaded.config,
  );
}
```

### Supported config formats

Files are discovered in this order:

| Basename | Extensions |
|---|---|
| `fusion-lint.config` | `.ts`, `.js`, `.json` |
| `.fusion-lintrc` | `.ts`, `.js`, `.json`, `.yml`, `.yaml` |

### `defineConfig` — object form

```typescript
// fusion-lint.config.ts
import { defineConfig } from '@equinor/fusion-framework-lint-config';

export default defineConfig({
  'require-tsdoc': 'error',
  'require-intent-comment': 'warn',
});
```

### `defineConfig` — builder form

Use the builder form to register custom rules or adjust built-in severities fluently:

```typescript
// fusion-lint.config.ts
import { defineConfig } from '@equinor/fusion-framework-lint-config';
import { someRule } from '@equinor/fusion-framework-lint-rules';

export default defineConfig((args) => {
  args.recommended = true; // use the recommended preset as the base

  // override severity for a built-in rule
  args.configureRule('require-tsdoc', (rule) => {
    rule.severity = 'error';
  });

  // disable a built-in rule entirely
  args.removeRule('require-intent-comment');

  // register a pre-built rule from the rules package
  args.addRule(someRule({ someArg: true }));

  // register an inline custom rule
  args.addRule({
    id: 'my-custom-rule',
    severity: 'warn',
    check: (source, filePath) => [],
  });

  // override the custom rule's severity after registration
  args.configureRule('my-custom-rule', (rule) => {
    rule.severity = 'error';
  });
});
```

## Customising severity without a config file

Spread `recommendedConfig` and override individual rules inline:

```typescript
import { recommendedRules, recommendedConfig } from '@equinor/fusion-framework-lint-config';
import { LintEngine } from '@equinor/fusion-framework-lint-core';

const engine = new LintEngine(recommendedRules, {
  ...recommendedConfig,
  'require-intent-comment': 'error',
});
```

## Disabling a rule

```typescript
const engine = new LintEngine(recommendedRules, {
  ...recommendedConfig,
  'require-intent-comment': 'off',
});
```

## API reference

| Export | Description |
|---|---|
| `recommendedRules` | Array of built-in `Rule` objects |
| `recommendedConfig` | Default severity map for all built-in rules |
| `defineConfig(config)` | Type helper — object form |
| `defineConfig(factory)` | Type helper — builder form |
| `loadLintConfig(options?)` | Finds and resolves the nearest config file |
| `ConfigBuilder` | Fluent builder class passed to factory configs |
| `ConfigBuilder.addRule` | Register a pre-built or inline custom rule |
| `ConfigBuilder.configureRule` | Override the severity of any rule by ID |
| `ConfigBuilder.removeRule` | Disable a rule (built-in or custom) by ID |
| `FusionLintFileConfig` | Type for the object config form |
| `FusionLintConfigFactory` | Type for the factory config form |
| `LoadedLintConfig` | Return type of `loadLintConfig` and `ConfigBuilder.resolve` |
| `CustomRuleDefinition` | Inline rule shape accepted by `ConfigBuilder.addRule` |
| `MutableRuleConfig` | Mutable severity view passed to `ConfigBuilder.configureRule` |

# @equinor/fusion-framework-lint-config

## 1.1.1-next.0

### Patch Changes

- e8aae1f: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.

  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:

  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```

- e8aae1f: Internal: depend on `@equinor/fusion-imports` through the `workspace:^` protocol instead of a registry range.

  The registry range was rewritten to an unpublished pre-release version during `changeset version`, which broke installs on the `next` branch.

- Updated dependencies [e8aae1f]
  - @equinor/fusion-framework-lint-core@1.0.1-next.0
  - @equinor/fusion-framework-lint-rules@1.1.1-next.0
  - @equinor/fusion-imports@2.0.3-next.0

## 1.1.0

### Minor Changes

- de2b4fb: Add `require-property-tsdoc` rule: requires class field (property) declarations — including Lit's `@property()` / `@state()` decorated fields — to have a preceding TSDoc block comment. `private`/`#name` and `static` fields are exempt. Included in the `recommended` rule preset.

### Patch Changes

- Updated dependencies [43183d8]
- Updated dependencies [de2b4fb]
  - @equinor/fusion-framework-lint-rules@1.1.0

## 1.0.1

### Patch Changes

- 19e0636: Internal: add missing TypeScript project `references` between the linting packages (`lint-core`, `lint-rules`, `lint-config`, `fusion-lint`, `lint-lsp`).

  Without these references, `tsc -b` couldn't resolve `@equinor/fusion-framework-lint-core`/`lint-config` types when a package was built in isolation (as happens during `npm publish`'s `prepack` step), causing the previous release's publish to fail partway through.

## 1.0.0

### Major Changes

- 80c3e4a: `CustomRuleDefinition.check` (used by `ConfigBuilder.addRule` and `defineConfig`'s builder form) now follows `@equinor/fusion-framework-lint-core`'s `check(source, ctx: LintContext)` signature instead of `check(source, filePath)`.

  ```typescript
  // Before
  args.addRule({
    id: "my-rule",
    severity: "warn",
    check: (source, filePath) => [],
  });

  // After
  args.addRule({ id: "my-rule", severity: "warn", check: (source, ctx) => [] });
  ```

  `recommendedRules` is unaffected — it still exports resolved `Rule[]` instances (each built-in factory is called internally).

### Minor Changes

- 80c3e4a: Add the new `filename-convention` rule to `recommendedRules`/`recommendedConfig` at `warn` severity.
- 80c3e4a: Add `ignorePatterns` config option to exclude files/directories from linting entirely, independent of `.gitignore`.

  ```typescript
  // fusion-lint.config.ts
  import { defineConfig } from "@equinor/fusion-framework-lint-config";

  export default defineConfig({
    ignorePatterns: ["**/__tests__/**"],
  });
  ```

  Also available on the builder form via `builder.ignorePatterns = [...]`. Both the `fusion-lint lint` and `fusion-lint changed` CLI commands now honor this option.

- 80c3e4a: Add `require-intent-comment/object-merge` rule, enabled by default in the `recommended` config at `warn` severity.

  The rule flags multi-source object merges that are missing an intent comment:
  - `Object.assign(target, ...sources)` calls with one or more source arguments.
  - Object or array literals spreading two or more sources, e.g. `{ ...a, ...b }` or `[...a, ...b]`.

  A no-op `Object.assign(target)` call (no sources) and single-spread-plus-overrides literals (the common immutable-update pattern, e.g. `{ ...state, enabled: true }`) are intentionally not flagged, so the rule only fires where a merge actually happens and key precedence matters.

### Patch Changes

- 80c3e4a: Internal: renamed source files to comply with the `filename-convention` lint rule (files renamed to match their primary named export, e.g. `engine.ts` → `LintEngine.ts`, `glob.ts` → `matches-basename-pattern.ts`). No public API changes.
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
  - @equinor/fusion-framework-lint-rules@1.0.0
  - @equinor/fusion-framework-lint-core@1.0.0

## 0.2.0

### Minor Changes

- b68e731: Initial release of `@equinor/fusion-framework-lint-config`.

  Provides the configuration loader and `recommended` rule preset for Fusion Framework linting. Supports `fusion-lint.config.ts`, `fusion-lint.config.js`, `.fusion-lintrc.json`, and `.fusion-lintrc.yaml`.

  `loadLintConfig` searches from the given directory upward through parent directories until a config file is found or the repository root (the directory containing `.git`) has been checked, so a single config at your monorepo root applies to every nested package. Pass `findUp: false` to only check the given directory.

### Patch Changes

- Updated dependencies [b68e731]
- Updated dependencies [b68e731]
  - @equinor/fusion-framework-lint-core@0.2.0
  - @equinor/fusion-framework-lint-rules@0.2.0

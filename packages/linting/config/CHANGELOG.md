# @equinor/fusion-framework-lint-config

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

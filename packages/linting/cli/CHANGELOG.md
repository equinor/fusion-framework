# @equinor/fusion-lint

## 0.2.0

### Minor Changes

- b68e731: Initial release of `@equinor/fusion-lint` CLI.

  Provides the `fusion-lint` command for running Fusion Framework lint rules from the terminal or CI:

  ```sh
  pnpm exec fusion-lint lint src/
  pnpm exec fusion-lint changed      # lint only git-changed .ts/.tsx files
  ```

  Outputs GitHub Actions annotations (`::warning` / `::error`) when running in CI.

  Both commands automatically pick up a `fusion-lint.config.*` / `.fusion-lintrc.*` project file, searching upward from the current directory to the repository root, layering it over `recommendedConfig` and allowing `--rule` overrides to take final precedence.

### Patch Changes

- Updated dependencies [b68e731]
- Updated dependencies [b68e731]
  - @equinor/fusion-framework-lint-config@0.2.0
  - @equinor/fusion-framework-lint-core@0.2.0

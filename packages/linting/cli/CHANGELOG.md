# @equinor/fusion-lint

## 0.3.3-next.0

### Patch Changes

- e8aae1f: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.

  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:

  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```

- Updated dependencies [e8aae1f]
- Updated dependencies [e8aae1f]
  - @equinor/fusion-framework-lint-config@1.1.1-next.0
  - @equinor/fusion-framework-lint-core@1.0.1-next.0

## 0.3.2

### Patch Changes

- 19e0636: Internal: add missing TypeScript project `references` between the linting packages (`lint-core`, `lint-rules`, `lint-config`, `fusion-lint`, `lint-lsp`).

  Without these references, `tsc -b` couldn't resolve `@equinor/fusion-framework-lint-core`/`lint-config` types when a package was built in isolation (as happens during `npm publish`'s `prepack` step), causing the previous release's publish to fail partway through.

## 0.3.1

### Patch Changes

- 3dcaae6: Internal: bump `chalk` from `5.6.2` to `6.0.0`. No API changes affect this repo's usage; chalk 6 raises its own Node.js requirement to `>=22`, already satisfied by this repo's `>=24` engines requirement.

## 0.3.0

### Minor Changes

- 80c3e4a: Add `ignorePatterns` config option to exclude files/directories from linting entirely, independent of `.gitignore`.

  ```typescript
  // fusion-lint.config.ts
  import { defineConfig } from "@equinor/fusion-framework-lint-config";

  export default defineConfig({
    ignorePatterns: ["**/__tests__/**"],
  });
  ```

  Also available on the builder form via `builder.ignorePatterns = [...]`. Both the `fusion-lint lint` and `fusion-lint changed` CLI commands now honor this option.

### Patch Changes

- 80c3e4a: Internal: added a missing intent comment in the CLI command builder; no public API changes.
- 80c3e4a: Internal: renamed source files to comply with the `filename-convention` lint rule (files renamed to match their primary named export, e.g. `engine.ts` → `LintEngine.ts`, `glob.ts` → `matches-basename-pattern.ts`). No public API changes.
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
- Updated dependencies [80c3e4a]
  - @equinor/fusion-framework-lint-config@1.0.0
  - @equinor/fusion-framework-lint-core@1.0.0

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

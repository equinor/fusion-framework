# @equinor/fusion-lint

## 1.0.2

### Patch Changes

- de95578: Publish a patch from the public Fusion Framework repository to restore npm build provenance for consumers using pnpm's `trustPolicy: no-downgrade`. This changeset does not change package APIs or runtime behavior.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/3187

## 1.0.1

No changes in this release.

## 1.0.1-next.0

### Patch Changes

- daa0612: Internal: publish every package on the `next` pre-release tag so the whole framework can be installed as a coherent set.
  
  Packages without their own changes are bumped only to receive a `-next.N` version and the `next` dist-tag on npm. Install with:
  
  ```bash
  pnpm add @equinor/fusion-framework-react-app@next
  ```
- b4c32d1: Internal: rebase the `next` pre-release line onto `main` after the stable release, so the `next` tag republishes these packages with the changes released on `latest`.
- Updated dependencies [daa0612]
  - @equinor/fusion-framework-lint-config@1.2.2-next.0
  - @equinor/fusion-framework-lint-core@1.0.5-next.0

## 1.0.0

### Major Changes

- 26bce27: Require Node.js 22 or newer and update progress spinners from Ora 9.4.1 to 10.0.0. Upgrade Node.js before installing this release; Node.js 20 is no longer supported.

## 0.3.5

### Patch Changes

- 0d1e372: Internal: generate `src/version.ts` in each package's `prebuild` so direct builds and `prepack` no longer depend on the root install script having run. No change to the published output.

## 0.3.4

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.
- Updated dependencies [5f244a1]
- Updated dependencies [d04e564]
  - @equinor/fusion-framework-lint-config@1.2.0

## 0.3.3

### Patch Changes

- f663b46: Internal: promote packages already published on the `next` prerelease channel to their stable versions.

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

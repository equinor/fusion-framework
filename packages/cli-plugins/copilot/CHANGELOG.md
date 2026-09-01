# @equinor/fusion-framework-cli-plugin-copilot

## 2.0.8

### Patch Changes

- 107cdc9: Internal: bump `@github/copilot-sdk` from `1.0.9` to `1.0.11` and adapt `firstStringProp` to the SDK's re-typed `ToolExecutionStartData.arguments` (now `JsonValue` instead of a plain index-signature object).
- 9fbe226: Internal: bump `agent-browser` from `0.34.0` to `0.35.1`.

## 2.0.7

### Patch Changes

- d04e564: Internal: restrict published package contents to compiled distribution files and required runtime artifacts so editor tooling does not load workspace TypeScript configurations from dependencies.

## 2.0.6

### Patch Changes

- f663b46: Internal: promote packages already published on the `next` prerelease channel to their stable versions.

## 2.0.5

### Patch Changes

- 6efb63e: Internal: stop running `agent-browser`'s and `koffi`'s native-binary install scripts on every `pnpm install`. Both now build explicitly in this package's `prepack` script, so publishing still bundles the binaries but everyday installs no longer download them.
- 6efb63e: Fix a build failure caused by `@github/copilot-sdk`'s stricter `JsonValue` typing on tool-call `arguments`. Tool-call detail extraction (`url`/`path`/`load`/`selector`) now narrows the union type before reading properties instead of relying on unchecked optional chaining.
- 6efb63e: Internal: move the `agent-browser` dependency from the repo root into this package, where it is actually used, instead of the workspace root `devDependencies`.

## 2.0.4

### Patch Changes

- 3dcaae6: Internal: bump `chalk` from `5.6.2` to `6.0.0`. No API changes affect this repo's usage; chalk 6 raises its own Node.js requirement to `>=22`, already satisfied by this repo's `>=24` engines requirement.

## 2.0.3

### Patch Changes

- 80c3e4a: Internal: Consolidate five single-export utility files under `src/utils/` into `helpers.ts` to reduce file fragmentation. No change to the public API.
- 80c3e4a: Internal: added a missing intent comment for array-spread logic; no public API changes.
- 80c3e4a: Internal: add clarifying intent comments and split `eval-resolve.ts`, `utils/agent-browser.ts`, `utils/process.ts`, `utils/server.ts`, `utils/daemon.ts`, and `commands/app/format.ts` into single-export modules re-exported from the existing barrels; no public API or behavior changes.
- 80c3e4a: Internal: add clarifying intent comments throughout `commands/app/**` and split `tools/write-file.ts`'s `createAppendFileTool` into its own `tools/append-file.ts` module; no public API or behavior changes.
- 80c3e4a: Internal: renamed 53 source files across `ai-base`, `ai-chat`, `ai-index`, and `copilot` to comply with the `filename-convention` lint rule (e.g. `config.ts` → `load-fusion-ai-config.ts`, `tools/write-file.ts` → `tools/create-write-file-tool.ts`, `prompts/plan.prompt.ts` → `prompts/create-plan-prompt.ts`). No public API changes.

## 2.0.2

### Patch Changes

- 68ca7f6: Internal: bump `commander` from `14.0.3` to `15.0.0`.
- 3d3cbb1: Internal: bump `@github/copilot-sdk` from `0.3.0` to `1.0.0`.

## 2.0.1

### Patch Changes

- 9a29a89: Internal: bump `@github/copilot-sdk` from `0.2.2` to `0.3.0`.
- a00ba38: Internal: bump `ora` from `9.3.0` to `9.4.0`.

## 2.0.0

### Patch Changes

- Updated dependencies [8d7b8a1]
- Updated dependencies [4711dbc]
  - @equinor/fusion-framework-cli@15.0.0

## 1.1.0

### Minor Changes

- c387362: Update `@github/copilot-sdk` dependency from `^0.1.32` to `^0.2.1`.

  `@github/copilot-sdk` 0.2.1 adds cross-SDK support for slash commands and UI elicitation (interactive input dialogs), previously Node.js-only. The published package.json range is updated accordingly.

  Note: for `0.x` packages `^0.1.x` and `^0.2.x` are incompatible ranges — consumers pinned to `^0.1.x` will need to update their own lockfiles.

### Patch Changes

- Updated dependencies [8f16c97]
- Updated dependencies [fe63b78]
  - @equinor/fusion-framework-cli@14.1.1

## 1.0.0

### Minor Changes

- abffa53: Add the `copilot app eval` CLI plugin for agentic Fusion application evaluation with the GitHub Copilot SDK and `agent-browser`.

  The new plugin can read eval markdown files, run a Fusion app, collect browser evidence, and return structured pass or fail verdicts with screenshots, snapshots, and console error checks. The login flow is available through both `--login` and `--logon`.

  Refs https://github.com/equinor/fusion-core-tasks/issues/724

### Patch Changes

- abffa53: Improve the cookbook eval agent system prompt so it reasons over user stories or provided context, plans browser steps, executes them agentically, and produces more explicit criterion-by-criterion verdicts.
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [ae92f13]
- Updated dependencies [abffa53]
- Updated dependencies [c123c39]
- Updated dependencies [3de232c]
- Updated dependencies [32bcf83]
  - @equinor/fusion-framework-cli@14.0.0

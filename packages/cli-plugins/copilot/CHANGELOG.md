# @equinor/fusion-framework-cli-plugin-copilot

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

# @equinor/fusion-framework-cli-plugin-copilot

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

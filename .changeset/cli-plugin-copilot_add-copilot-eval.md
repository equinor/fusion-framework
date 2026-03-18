---
"@equinor/fusion-framework-cli-plugin-copilot": minor
---

Add the `copilot app eval` CLI plugin for agentic Fusion application evaluation with the GitHub Copilot SDK and `agent-browser`.

The new plugin can read eval markdown files, run a Fusion app, collect browser evidence, and return structured pass or fail verdicts with screenshots, snapshots, and console error checks. The login flow is available through both `--login` and `--logon`.

Refs https://github.com/equinor/fusion-core-tasks/issues/724
---
"@equinor/fusion-framework-dev-portal": patch
---

Render application content inside a stable `#app-section` container so browser-driven evaluation tools can target the app surface consistently.

This makes automated cookbook and dev-portal validation more reliable when using `agent-browser` and Copilot-based evaluation flows.

Refs https://github.com/equinor/fusion-core-tasks/issues/724
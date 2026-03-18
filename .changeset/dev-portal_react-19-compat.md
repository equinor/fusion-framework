---
"@equinor/fusion-framework-dev-portal": patch
---

Upgrade dev-portal dependencies for React 19 compatibility.

- Upgrade `react-router` from v6 to v7.13 (backward-compatible, no code changes required)
- Upgrade `@equinor/fusion-react-styles` to 2.0.0 (removes `@material-ui/styles` dependency)
- Upgrade `@equinor/fusion-react-context-selector` to 2.0.1

This resolves the React 19 blocker identified in https://github.com/equinor/fusion-framework/issues/3698

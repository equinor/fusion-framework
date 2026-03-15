---
"@equinor/fusion-framework-dev-portal": patch
---

Upgrade to React 19 compatible versions of fusion-react components

Updated the following dependencies to their React 19 compatible versions:
- `@equinor/fusion-react-styles`: `^0.6.4` → `2.0.0` - Material-UI dependency removed
- `@equinor/fusion-react-context-selector`: `^1.0.6` → `2.0.1`

The `@equinor/fusion-react-styles` upgrade removes the deprecated `@material-ui/styles@^4.11.5` dependency which was incompatible with React 19.

This resolves the React 19 blocker identified in issue https://github.com/equinor/fusion-framework/issues/3698


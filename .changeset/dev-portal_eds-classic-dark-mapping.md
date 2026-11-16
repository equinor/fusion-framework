---
"@equinor/fusion-framework-dev-portal": patch
---

In dark mode, the dev portal maps the classic EDS colour variables (`--eds_*`), which EDS 2.x components read through the `tokens` object, to the scheme-aware `--eds-color-*` variables using `classicColourSchemeStyles()` from `@equinor/fusion-react-styles`, which applies `classicColourDeclarations()` under the dark colour-scheme selectors. EDS components in the portal and in hosted apps, including portalled menus, tooltips and dialogs, then follow dark mode. Light mode is unchanged.

Refs equinor/fusion-core-tasks#2755

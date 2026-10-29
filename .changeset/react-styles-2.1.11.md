---
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-cookbook-app-react-styling": patch
"portal-analytics": patch
---

Upgrade `@equinor/fusion-react-styles` to `^2.1.11` (directly, and through `@equinor/fusion-react-context-selector` `2.0.12` and `@equinor/fusion-react-errorboundary` `2.0.14`), which requires `@equinor/fusion-wc-theme` `^1.2.6`. There, `<fwc-theme>` always sets `data-color-scheme="light"`, which temporarily keeps EDS colours and native browser controls in light mode regardless of OS or browser settings.

Ref: equinor/fusion-core-tasks#2120

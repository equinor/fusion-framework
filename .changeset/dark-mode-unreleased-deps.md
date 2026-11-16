---
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-cookbook-app-react-router": patch
"@equinor/fusion-framework-cookbook-app-react-styling": patch
"@equinor/fusion-framework-cookbook-app-react-people": patch
"portal-analytics": patch
---

Internal: bump the Fusion React and web components to their dark mode releases: `@equinor/fusion-react-styles` ^3.0.0, `@equinor/fusion-react-context-selector` ^3.0.0, `@equinor/fusion-react-person` ^3.0.0, `@equinor/fusion-react-side-sheet` ^2.2.0, `@equinor/fusion-react-errorboundary` ^2.0.15, `@equinor/fusion-wc-chip` ^2.0.0, `@equinor/fusion-wc-person` ^4.0.0 and `@equinor/fusion-wc-markdown` ^2.0.0. These versions require the host to load `@equinor/eds-tokens/css/variables`; the dev portal already does.

Refs equinor/fusion-core-tasks#2755

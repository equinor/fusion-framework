---
"@equinor/fusion-framework-cookbook-app-react": patch
"@equinor/fusion-framework-cookbook-app-react-ag-grid": patch
"@equinor/fusion-framework-cookbook-app-react-ai": patch
"@equinor/fusion-framework-cookbook-app-react-apploader": patch
"@equinor/fusion-framework-cookbook-app-react-assets": patch
"@equinor/fusion-framework-cookbook-app-react-bookmark": patch
"@equinor/fusion-framework-cookbook-app-react-bookmark-advanced": patch
"@equinor/fusion-framework-cookbook-app-react-charts": patch
"@equinor/fusion-framework-cookbook-app-react-context": patch
"@equinor/fusion-framework-cookbook-app-react-context-custom-error": patch
"@equinor/fusion-framework-cookbook-app-react-dev-server-telemetry": patch
"@equinor/fusion-framework-cookbook-app-react-environment-variables": patch
"@equinor/fusion-framework-cookbook-app-react-feature-flag": patch
"@equinor/fusion-framework-cookbook-app-react-mock-playwright": patch
"@equinor/fusion-framework-cookbook-app-react-module": patch
"@equinor/fusion-framework-cookbook-app-react-msal": patch
"@equinor/fusion-framework-cookbook-app-react-people": patch
"@equinor/fusion-framework-cookbook-app-react-roles": patch
"@equinor/fusion-framework-cookbook-app-react-router": patch
"@equinor/fusion-framework-cookbook-app-react-router-legacy": patch
"@equinor/fusion-framework-cookbook-app-react-settings": patch
"@equinor/fusion-framework-cookbook-app-react-state": patch
"@equinor/fusion-framework-cookbook-app-react-styling": patch
"portal": patch
"portal-analytics": patch
"poc-portal": patch
"@equinor/fusion-framework-dev-portal": patch
"@equinor/fusion-framework-react": patch
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-react-components-bookmark": patch
"@equinor/fusion-framework-react-components-people-provider": patch
"@equinor/fusion-framework-react-components-roles": patch
"@equinor/fusion-framework-react-module": patch
"@equinor/fusion-framework-react-module-bookmark": patch
"@equinor/fusion-framework-react-module-context": patch
"@equinor/fusion-framework-react-module-event": patch
"@equinor/fusion-framework-react-module-http": patch
"@equinor/fusion-framework-react-module-signalr": patch
"@equinor/fusion-framework-react-router": patch
"@equinor/fusion-framework-vitest-plugin-react-app": patch
"@equinor/fusion-observable": patch
"@equinor/fusion-query": patch
---

Internal: centralize direct React runtime and type dependencies in a shared workspace
catalog. Pin React and React DOM to the same 19.3.1 runtime version to prevent
incompatible resolutions. Consumer-facing peer dependency ranges are unchanged.

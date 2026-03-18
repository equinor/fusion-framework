---
"@equinor/fusion-framework": major
"@equinor/fusion-framework-app": major
"@equinor/fusion-framework-cli": major
"@equinor/fusion-framework-cli-plugin-ai-base": major
"@equinor/fusion-framework-cli-plugin-ai-chat": major
"@equinor/fusion-framework-cli-plugin-ai-index": major
"@equinor/fusion-framework-cli-plugin-ai-mcp": major
"@equinor/fusion-framework-dev-portal": major
"@equinor/fusion-framework-dev-server": major
"@equinor/fusion-framework-module": major
"@equinor/fusion-framework-module-ag-grid": major
"@equinor/fusion-framework-module-ai": major
"@equinor/fusion-framework-module-analytics": major
"@equinor/fusion-framework-module-app": major
"@equinor/fusion-framework-module-bookmark": major
"@equinor/fusion-framework-module-context": major
"@equinor/fusion-framework-module-event": major
"@equinor/fusion-framework-module-feature-flag": major
"@equinor/fusion-framework-module-http": major
"@equinor/fusion-framework-module-msal": major
"@equinor/fusion-framework-module-msal-node": major
"@equinor/fusion-framework-module-navigation": major
"@equinor/fusion-framework-module-service-discovery": major
"@equinor/fusion-framework-module-services": major
"@equinor/fusion-framework-module-signalr": major
"@equinor/fusion-framework-module-telemetry": major
"@equinor/fusion-framework-module-widget": major
"@equinor/fusion-framework-react": major
"@equinor/fusion-framework-react-ag-charts": major
"@equinor/fusion-framework-react-ag-grid": major
"@equinor/fusion-framework-react-app": major
"@equinor/fusion-framework-react-components-bookmark": major
"@equinor/fusion-framework-react-components-people-provider": major
"@equinor/fusion-framework-react-module": major
"@equinor/fusion-framework-react-module-bookmark": major
"@equinor/fusion-framework-react-module-context": major
"@equinor/fusion-framework-react-module-event": major
"@equinor/fusion-framework-react-module-http": major
"@equinor/fusion-framework-react-module-signalr": major
"@equinor/fusion-framework-react-router": major
"@equinor/fusion-framework-vite-plugin-api-service": major
"@equinor/fusion-framework-vite-plugin-raw-imports": major
"@equinor/fusion-framework-vite-plugin-spa": major
"@equinor/fusion-framework-widget": major
"@equinor/fusion-imports": major
"@equinor/fusion-load-env": major
"@equinor/fusion-log": major
"@equinor/fusion-observable": major
"@equinor/fusion-query": major
---

Major version bump for Fusion Framework React 19 release.

All packages are bumped to the next major version as part of the React 19 upgrade. This release drops support for React versions below 18 and includes breaking changes across the framework.

**Breaking changes:**
- Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
- React Router upgraded from v6 to v7
- Navigation module refactored with new history API
- `renderComponent` and `renderApp` now use `createRoot` API

**Migration:**
- Update your React version to 18.0.0 or higher before upgrading
- Replace `NavigationProvider.createRouter()` with `@equinor/fusion-framework-react-router`
- See individual package changelogs for package-specific migration steps

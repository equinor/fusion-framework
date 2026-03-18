---
"@equinor/fusion-framework-react-app": major
---

Modernize `renderComponent` and `renderApp` to use React 18's `createRoot` API. These functions are no longer deprecated.

The legacy `ReactDOM.render` path has been removed. Both functions now use `createRoot` internally, matching React 18+ best practices. No migration is required if you already use React 18+.


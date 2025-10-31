---
"@equinor/fusion-framework-react-app": major
---

Require React 18+ and modernize `renderComponent` and `renderApp` functions to use React 18's `createRoot` API. These functions are no longer deprecated.

**Migration:** Update to React 18+. If you use `renderComponent` or `renderApp`, these functions now use the `createRoot` API internally. No immediate migration is required unless you are using features specific to React 17.

Closes https://github.com/equinor/fusion-framework/issues/3504


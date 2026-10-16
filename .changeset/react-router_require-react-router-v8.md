---
"@equinor/fusion-framework-react-router": major
---

Upgrade to React Router v8 (`react-router` and `@react-router/dev` `^8.4.0`).

**Breaking changes and required actions**

- **React 19.2.7 or later is required.** The `react` and `react-dom` peer dependencies are now `^19.2.7`, and `react-dom` is no longer optional. React 18 is no longer supported by this package; apps on React 18 get a peer dependency warning on install and must upgrade `react` and `react-dom` first.
- **ESM only, Node.js 22.22.0 or later.** React Router v8 ships ESM only and requires Node.js 22.22.0 or later. CommonJS-only build or test setups may fail to load the router.
- **`react-router-dom` is removed upstream.** Import from `@equinor/fusion-framework-react-router`, `react-router` or `react-router/dom` instead.
- v7 future-flag behaviour is now the default in React Router v8. See the upstream [React Router v8 release notes](https://github.com/remix-run/react-router/releases).

Fusion route definitions, page exports, the `Router` component and the interop bridge keep working. Internally, `Router` no longer sets the removed `hasErrorBoundary` route property; `errorElement` and `ErrorBoundary` behave as before.

Migration guide: [`packages/react/router/docs/migration.md`](https://github.com/equinor/fusion-framework/blob/main/packages/react/router/docs/migration.md) (updated separately). Tracking: equinor/fusion-core-tasks#1626.

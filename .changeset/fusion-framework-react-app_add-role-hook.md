---
"@equinor/fusion-framework-react-app": minor
---

Add the `/roles` entry point with `useRole` for checking active and claimable access roles and
claiming a role assignment from React applications.

Add an optional `onError` render argument so application hosts can handle initialization failures
and present required-role recovery. `makeComponent` reports module-initialization failures through
the callback while preserving the rejection for React error handling. On React 19, `renderComponent`
also forwards uncaught root errors; this root-level forwarding is not available on React 18.

Related to #5449.

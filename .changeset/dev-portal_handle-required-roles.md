---
"@equinor/fusion-framework-module-app": patch
"@equinor/fusion-framework-module-roles": patch
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-dev-portal": patch
---

Report uncaught React application initialization failures to the host's shared error boundary and
add `@equinor/fusion-framework-react-components-roles`. Its `RoleBoundary` optionally guards a
component subtree with required access roles and handles required-role errors thrown by descendants.
The internal recovery views distinguish unregistered, unavailable, and claimable roles, display
access-role descriptions, activate claimable assignments, and let the development app loader retry
the application after access is granted.
Add `RolesProvider`, `useRoles`, and `useClaimableRoles` to the Roles component package as
straightforward React APIs backed by shared observable actions and flows for active-role,
claimable-role, and activation state.

Add `RolesView` as the reusable active and claimable role overview. The development portal now
enables the Roles module and uses `RolesProvider` and `RolesView` instead of maintaining a separate
account-scoped Roles V2 HTTP client. Its flyout uses the compact `RolesView` presentation with role
information buttons, switch-based activation controls, and a recent Expired tab for quick
reactivation. Role information includes the assignment reason, validity, scope, and activation
status. The Roles provider supports deactivation, refreshes visible sessions on an interval and
window focus, and offers in-place reclaiming when an active claim expires.

Fixes #5449.

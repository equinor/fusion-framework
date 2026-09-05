---
"@equinor/fusion-framework-react-components-roles": minor
---

Introduce the initial release of `@equinor/fusion-framework-react-components-roles` for Roles V2
overviews and required-access recovery. Enable the Roles module and mount the React `RolesProvider`
inside its Fusion module context, then render `RolesView` or consume `useRoles` and `useClaimableRoles`.
There is no previously published React roles package to upgrade.

`RolesView` offers application cards or compact Claimable, Active, and Expired tabs. Compact expiry
shortcuts show the three newest eligible assignments from the previous seven days; additional
assignments remain in Claimable. Activation failures remain visible with preserved audit input,
including during in-place expiry recovery.
Background refreshes retain open dialogs and audit input. Invalid expiration metadata is displayed
separately from missing expiration while retaining browser-local date presentation.

Hooks share collection loading, mutation state, and refresh. Mutations take claimable assignment IDs
and reject on mutation failure, while later refresh failures are reported by collection state.
Collection reload promises resolve on load errors but reject on store disposal.
Replacing the module provider resets the React scope, including collections and recovery history.

`RoleBoundary` checks required access-role names before mounting children and recovers missing-role
errors through the original module provider. Changed requirements or providers trigger another check;
the gate is not continuous authorization and does not replace backend access enforcement.

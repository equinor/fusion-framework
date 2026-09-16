---
"@equinor/fusion-framework-cookbook-app-react-roles": minor
---

Add a React cookbook for requiring `ProView.Admin.DevOps`, displaying active assignments with
`useActiveAccessRoleAssignments`, and activating claimable assignments with
`useClaimableRoleAssignments`. Include deterministic role data through a local Roles
V2 mock server and a browser test of required-role recovery and the resolved app.
The active-role example uses complete scope metadata and per-identity duplicate counters for
stable list keys when assignments change.

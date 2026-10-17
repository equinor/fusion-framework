# @equinor/fusion-framework-cookbook-app-react-roles

## 0.1.3

### Patch Changes

- 5479006: Internal: wait up to 20 seconds for mounted cookbook UI before Playwright feature assertions, cap each test at 45 seconds, probe the served SPA bootstrap module, and retain failure traces, screenshots, and HTML reports. No retries are added.
- 79014cd: Internal: centralize direct React runtime and type dependencies in a shared workspace
  catalog. Pin React and React DOM to the same 19.3.1 runtime version to prevent
  incompatible resolutions. Consumer-facing peer dependency ranges are unchanged.

## 0.1.2

### Patch Changes

- 43bc1f0: Link the Roles cookbook to the complete, application-agnostic Roles V2 adoption and testing workflow.
  
  Refs https://github.com/equinor/fusion-core-tasks/issues/2102
- e6b881a: Use `defineRolesV2Mock` for cookbook role policy and verify concurrent personas plus identity switching in Playwright.
  
  Refs: https://github.com/equinor/fusion-core-tasks/issues/2100

## 0.1.1

### Patch Changes

- f0e9cc0: Internal: use the workspace Playwright catalog so all packages resolve a single compatible version.

## 0.1.0

### Minor Changes

- e54d1ef: Add a React cookbook for requiring `ProView.Admin.DevOps`, displaying active assignments with
  `useActiveAccessRoleAssignments`, and activating claimable assignments with
  `useClaimableRoleAssignments`. Include deterministic role data through a local Roles
  V2 mock server and a browser test of required-role recovery and the resolved app.
  The active-role example uses complete scope metadata and per-identity duplicate counters for
  stable list keys when assignments change.

### Patch Changes

- a3a2417: Fix source links in the Roles cookbook guide so they work from both GitHub and the published
  documentation site.

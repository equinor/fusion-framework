---
"@equinor/fusion-framework-dev-portal": patch
---

Use the shared Roles V2 overview in the person side sheet for viewing active and claimable
assignments, activating or deactivating roles, and reclaiming recently expired access.

Route application initialization failures and reported render errors through the host error
boundary. Missing required roles can be claimed before retrying the application without
replacing the selected app instance; unrelated errors retain the generic or manifest fallback.

Related to #5449.

Internal: remove the unused React app dependency and TypeScript project reference so the
portal's build graph does not cycle through the app-test plugin and CLI.

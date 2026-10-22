---
"@equinor/fusion-framework-module-roles": minor
---

Report Roles operations as timed operational records. Each operation records one
`fusion.roles.<operation>.duration` metric, for example
`fusion.roles.get-access-roles.duration`, with a `success`, `failure` or `cancelled`
outcome. Aborting `getAccessRoles` and a listener cancelling activation are cancellations;
failures add one sanitized `.failure` exception. Thrown `RolesError` values are unchanged.

**Migration:** the `RolesProvider.<operation>` debug events and failure exceptions are
replaced by these records. Failure records no longer carry the original error as a cause;
read the thrown `RolesError` locally when the cause is needed.

Ref: #5804.

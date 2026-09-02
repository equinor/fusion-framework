---
"@equinor/fusion-framework-module-roles": minor
---

Add a first-class Fusion Framework module for showing active and claimable Roles V2 assignments,
claiming a role, checking active roles and claim eligibility, and requiring roles before bootstrap
through an authenticated, service-discovery-backed provider. The provider emits a typed,
cancelable role-claim event before activation and records privacy-safe operation telemetry when
those modules are enabled. Built-in reads use Fusion Query caching and refresh after a successful
claim.

Closes #5449

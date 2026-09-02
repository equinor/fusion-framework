---
"@equinor/fusion-framework-module-roles": minor
---

Add a first-class Fusion Framework module for showing active and claimable Roles V2 assignments,
claiming a role, checking active roles and claim eligibility, and requiring roles before bootstrap
through an authenticated, service-discovery-backed provider. The configurator creates the default
client and module initialization supplies its current-account resolver. The provider emits a
typed, cancelable role-claim event before activation and records privacy-safe operation telemetry
when those modules are enabled. Built-in reads use account-isolated Fusion Query caching and
refresh after a successful claim. Typed Roles, required-role, and claim errors support reliable
consumer error handling.

Closes #5449

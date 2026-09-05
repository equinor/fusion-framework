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
consumer error handling. A `/mock` entry point seeds in-memory role and claim data while exercising
the production initializer and provider.

Client operations use cold RxJS observables, including single-page access-role responses.
The provider exposes Promises for unpaged operations and converts access-role page observables
into a lazy async iterator: consumers control page
requests and memory use, can stop early, and can abort in-flight requests. Required-role lookups
coordinate parallel requests so failures cancel sibling work rather than leaving unhandled rejections.

Add role deactivation and explicit read-cache refresh options. Required-role errors support
cross-bundle recognition and carry recovery operations; hosts can inspect required-role existence,
descriptions, and claimable assignments even after application initialization fails.
Await authentication initialization during configuration so failures propagate immediately,
while checking the currently selected account only when a role operation executes.

Closes #5449

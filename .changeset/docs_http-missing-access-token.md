---
"@equinor/fusion-framework-docs": patch
---

Document scoped HTTP requests failing before fetch when no MSAL access token is available,
including migration guidance for intentionally anonymous endpoints.

Document the shared `HttpException` base, cross-bundle `.is(error)` guards, unknown response
and JSON payload types, and migration from generic error names and direct `Error` prototypes.
Explain response subtype recognition and the limits for older bundles and renamed custom
subclasses.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2035

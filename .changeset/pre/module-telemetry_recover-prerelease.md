---
"@equinor/fusion-framework-module-telemetry": patch
---

Publish the current operational telemetry runtime under a fresh prerelease version.
The historical `8.0.0-next.0` and `8.0.0-next.1` releases do not contain the
`createOperationalTelemetry` export required by the current MSAL and service
discovery prereleases. Resume versioning after the last occupied prerelease so
publishing no longer skips the updated package.

Refs equinor/fusion-portal-client#160.

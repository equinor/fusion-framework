---
"@equinor/fusion-framework-module-http": patch
---

Forward the request-local telemetry export marker to token acquisition. When a request
marked with `markTelemetryExportRequest` declares scopes, the MSAL request handler passes
the same marker to `acquireAccessToken`, so authentication telemetry can skip the
exporter's own token request. Unmarked application requests are unchanged.

Ref: #5804.

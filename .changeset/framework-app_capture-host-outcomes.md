---
"@equinor/fusion-framework-app": minor
---

Preserve app identity on built-in operational records through framework relays,
using the generic telemetry host fields: source kind `app`, with the manifest key and
build version as `hostName` and `hostVersion`. Report sanitized pre-provider
configuration failures to an eligible parent without replacing the original
application error or creating an exporter.

Ref: #5803.

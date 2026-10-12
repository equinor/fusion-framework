---
"@equinor/fusion-framework-dev-server": minor
---

Enable development-only OTLP/HTTP logs and browser request spans by setting `FUSION_DEV_SERVER_OTLP_ENDPOINT` to a collector URL when starting the dev server, without changing app code. Same-origin collection routes forward both signals, with app-key and source attributes. W3C trace context connects browser requests to instrumented backends, and active-span logs share their trace IDs.

Existing app telemetry adapters and registered tracer providers take precedence. Production builds are unaffected, and collector outages are reported once without breaking the app.

Ref: equinor/fusion-core-tasks#2241.

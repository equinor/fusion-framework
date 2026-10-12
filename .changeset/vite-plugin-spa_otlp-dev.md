---
"@equinor/fusion-framework-vite-plugin-spa": minor
---

Configure the telemetry module's public `OtlpAdapter` from the dev-server environment bridge. Add standard browser fetch, XMLHttpRequest, and document-load instrumentation with W3C trace-context propagation and OTLP span export. App records carry app-key and source attributes; active-span logs correlate with browser and backend spans.

The bootstrap activates only when an endpoint is configured. Existing app telemetry and registered tracer providers remain authoritative; the serve-only dev-server bridge does not activate production builds.

Ref: equinor/fusion-core-tasks#2241.

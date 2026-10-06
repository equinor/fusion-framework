---
"@equinor/fusion-framework-dev-portal": minor
---

Send analytics to the local mock server in mock mode, as the Fusion portal does in production.

- The dev portal now registers the Fusion portal's `app-loaded`, `app-selected`, and `context-selected` collectors.
- With `--mock`, it also sends analytics, including apps' `useTrackFeature` events, to the `monitor` service of the local mock server (`portal.id` is `dev-portal`). Apps can then check their analytics in Playwright, or read them through the app-feature events query.
- Without `--mock`, no analytics leave the browser, because the discovered `monitor` would be the real service. The `fusionLogAnalytics` feature flag still logs events to the console.
- When the mock server serves no analytics (`--no-analytics`), the portal logs a warning and starts without sending them.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2182

---
"@equinor/fusion-framework-module-navigation": major
---

Connect available host telemetry after initialization without adding a startup
dependency. Explicit `setTelemetry(provider)` and `setTelemetry(undefined)` continue
to take precedence. Automatic wiring excludes per-action debug chatter.

**Migration:** navigation telemetry no longer exposes locations, previous locations,
route state or raw action payloads. Detailed explicit-provider action events use
the static `Navigation::action` name with a controlled action type instead of
dynamic per-action names. Read navigation state/events locally when route data is
needed; routing behavior itself is unchanged. Diagnostic failures cannot break navigation.

Ref: #5803.

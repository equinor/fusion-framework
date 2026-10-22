---
"@equinor/fusion-framework-module-navigation": major
---

**Breaking:** navigation telemetry changes its event names and payloads. Dashboards,
queries and relay filters that match per-action event names or read location and
action properties must be updated (see **Migration**). The navigation API and routing
behavior are unchanged.

Connect available host telemetry after initialization without adding a startup
dependency. Explicit `setTelemetry(provider)` and `setTelemetry(undefined)` continue
to take precedence. Automatic wiring excludes per-action debug chatter. Custom
navigation providers opt in through the optional `INavigationProvider.connectTelemetry`
method; the module no longer checks for the concrete `NavigationProvider` class.

**Migration:** navigation telemetry no longer exposes locations, previous locations,
route state or raw action payloads. Detailed explicit-provider action events use
the static `Navigation::action` name with a controlled action type instead of
dynamic per-action names. Read navigation state/events locally when route data is
needed; routing behavior itself is unchanged. Diagnostic failures cannot break navigation.

Ref: #5803.

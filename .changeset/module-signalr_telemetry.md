---
"@equinor/fusion-framework-module-signalr": minor
---

Record SignalR connection lifecycles when the telemetry module is available:
`fusion.signalr.connect.duration`, `reconnect.duration` and `disconnect.duration`, with a
sanitized failure exception for failures, and a `fusion.signalr.connection-lost`
notification when an established connection closes unexpectedly. Unsubscribing while a
connection is starting is a cancelled connect, not a failure. Hub names, URLs, tokens and
messages are never recorded, and connection and reconnection behavior is unchanged.

The module now disposes the provider it created when the host disposes it, so
telemetry stops at teardown.

Ref: #5804.

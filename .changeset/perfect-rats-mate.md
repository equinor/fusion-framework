---
'@equinor/fusion-framework-legacy-interopt': minor
---

**LegacyAppContainer**

change behavior of internal application state of `LegacyAppContainer`.
current value is set to 20ms, this can be adjusted later (if needed).

Without this throttle the internal state could en up in death-loop since `DistributedState` is triggered on `window.requestAnimationFrame`, which would make a ping pong effect

other:
- `#manifest` is renamed to `#state`
- subscription to Framework app changed is now directly on the app module vs event
- added `dispose` since subscription/listeners are not cleaned up (should only be one `LegacyAppContainer`)

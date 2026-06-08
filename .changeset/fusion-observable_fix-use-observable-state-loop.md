---
"@equinor/fusion-observable": patch
---

Fix useObservableState rerender loops caused by stateful observables that synchronously emit an unchanged current value on subscribe.

The hook now skips redundant notifications when value, error, or complete state is unchanged, preventing infinite render/subscription cycles in apps with unstable observable references.

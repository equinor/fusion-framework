---
"@equinor/fusion-observable": patch
---

Fix infinite re-render loop in `useObservableState` when used with stateful observables (`BehaviorSubject`, `FlowSubject`).

The `useSyncExternalStore` integration introduced in the previous release had two interacting bugs:

1. **Listener registered before subscription**: `onStoreChange` was added to the listeners set before `subject.subscribe()` was called. Synchronous-emitting observables (e.g. `BehaviorSubject`) fire `next` immediately inside `subscribe`, which triggered `onStoreChange` synchronously from within the `subscribe` callback. React's `useSyncExternalStore` contract forbids calling the change notifier during the subscribe call itself, causing an infinite re-render loop.

2. **Spurious snapshot object on unchanged value**: The `next` handler always created a new snapshot object (`{ ...snapshot, value }`), even when the value was identical. Because `useSyncExternalStore` uses `Object.is` to detect tearing, a new object reference was always treated as a change, which forced a re-render, re-subscribed, replayed the BehaviorSubject value again, and looped indefinitely.

**Fix**: Subscribe first (so any synchronous emission updates the snapshot without notifying listeners), then add the listener. Also skip snapshot creation when the incoming value is `Object.is`-equal to the current snapshot value.

Any application using `useObservableState` with a `BehaviorSubject` or `FlowSubject` will have been caught in this loop since upgrading to `9.0.1`. Upgrade to this patch to resolve it — no consumer code changes required.

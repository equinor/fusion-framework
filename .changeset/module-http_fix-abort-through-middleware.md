---
"@equinor/fusion-framework-module-http": patch
---

Fix `HttpClient.abort()` not cancelling the underlying network call when middleware is registered. `next(...)` resolves through a `Promise`, so a middleware calling it created a subscription to `_performFetch` outside the tree the `takeUntil(this._abort$)` teardown reaches -- the outer request settled, but the real `fetch` kept running. `abort()` now also aborts a per-request `AbortSignal` combined into the request `init`, so `_performFetch` (`fromFetch` by default) is cancelled directly regardless of whether middleware severed the RxJS subscription chain.

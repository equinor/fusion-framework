---
"@equinor/fusion-framework": patch
---

`init` no longer throws when no DOM is present.

The running instance is published as `window.Fusion` for portal shells and widgets. That assignment was unguarded, so initializing the framework anywhere without a `window` — a test runner using the `node` environment, or a server-side render — failed with `ReferenceError: window is not defined`.

The assignment is now skipped when `window` is undefined. Browser behaviour is unchanged.

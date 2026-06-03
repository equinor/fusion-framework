---
"@equinor/fusion-observable": patch
---

Internal: refactor `useObservableState` to use React `useSyncExternalStore` while preserving the existing API and behavior for value, error, completion, and teardown handling.

Closes: https://github.com/equinor/fusion-framework/issues/3819

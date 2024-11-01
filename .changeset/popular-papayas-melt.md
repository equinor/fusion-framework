---
'@equinor/fusion-observable': patch
---

Updated the `useObservableState` hook to ensure type safety and improve code readability.

-   Modified the return type of `useObservableState` to `ObservableStateReturnType<S | undefined, E>`.
-   Ensured that the `useObservableExternalStore` function is called with the correct type parameters.

**How to update:**

No changes are required for consumers of the `useObservableState` hook. The update ensures better type safety and code readability internally.

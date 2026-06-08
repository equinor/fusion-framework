---
"@equinor/fusion-observable": patch
---

Internal: `useObservableState` — stabilize store across re-renders

Previously, passing non-memoized values for `opt.initial` or `opt.teardown`
(e.g. inline object literals or arrow functions) caused `useMemo` to recreate
the store on every render, resetting state and triggering an infinite re-render
loop.

The store is now recreated only when the `subject` reference changes.
`initial` and `teardown` are stored in refs that are kept current on every
render, so the store always reads the latest values when a new subject is
provided — without those values being `useMemo` dependencies.

A new `persist` option is also available as an escape hatch for cases where
the subject cannot be memoized at the call site:

```tsx
// subject is a prop and may not be stable — freeze it at first render
const { value } = useObservableState(stream, { persist: true });
```

When `persist: true`, the subject reference is frozen at mount and the store
is never recreated, even if the caller passes a different observable instance
on subsequent renders.

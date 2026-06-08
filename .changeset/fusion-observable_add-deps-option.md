---
"@equinor/fusion-observable": minor
---

Add an optional `deps` setting to `useObservableState` so callers can control when the observable subscription is recreated.

By default, the hook continues to follow the `subject` reference. Passing `deps: []` keeps the first subject for the component lifetime, while custom dependencies such as `deps: [id]` let callers recreate observable instances during render without resubscribing until the selected dependency values change.

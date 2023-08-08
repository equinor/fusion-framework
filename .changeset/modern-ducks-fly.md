---
'@equinor/fusion-observable': minor
---

Allow using string path for observable selector

> simplify usage of `useObservableSelector`

```ts
// new
useObservableSelector(source$, 'foo.bar');
// existing
useObservableSelector(source$, useCallback(source => source.foo.bar, []));
```

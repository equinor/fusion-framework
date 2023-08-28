---
'@equinor/fusion-query': patch
---

Query cache missed on first access since when creating a new cache record, updated was never set.

> when creating a cache item, `entry.created` and `entry.updated` are set to `Date.now()`, but `entry.updates` are only incremented when updating. 

> when invalidating a cache record, `entry.updated` is deleted, which triggers the `defaultCacheValidator` to miss cache

```ts
const defaultCacheValidator =
    <TType, TArgs>(expires = 0): CacheValidator<TType, TArgs> =>
    (entry) =>
        (entry.updated ?? 0) + expires > Date.now();
```


__IMPORTANT__

any consumer of this package should update ASAP to improve network performance.

_discovered when duplicate service discovery calls was executed from cli portal_

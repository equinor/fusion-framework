---
"@equinor/fusion-query": minor
---

`QueryCache` now supports invalidation of all entries

When not providing key for `QueryCache.invalidate`, all records will be set to invalid

```diff
QueryCache.ts
-     public invalidate(key: string) {
+     public invalidate(key?: string) {
  this.#state.next(actions.invalidate(key));
}
```

```diff
create-reducer.ts
.addCase(actions.invalidate, (state, action) => {
+   const invalidKey = action.payload ? [action.payload] : Object.keys(state);
-   const entry = state[action.payload];
+   for (const key of invalidKey) {
+       const entry = state[key];
        if (entry) {
           delete entry.updated;
        }
+   }
})
```

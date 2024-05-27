---
"@equinor/fusion-query": patch
---

---

## "@equinor/fusion-query": minor

This release introduces a new method `persistentQuery` to the `Query` class. This method allows for creating persistent queries that automatically update when the underlying cache entry changes.

The `persistentQuery` method was added to simplify the process of creating queries that need to stay up-to-date with the latest data. Previously, developers had to manually handle cache updates and re-subscribe to the query observable when changes occurred. With `persistentQuery`, this process is automated, reducing boilerplate code and improving developer experience.

To use the `persistentQuery` method, simply call it with the desired query arguments and options, similar to the existing `query` method:

```typescript
import { Query } from "@equinor/fusion-query";

const query = new Query({
  /* query options */
});

const persistentQuery$ = query.persistentQuery({ id: "123" });

persistentQuery$.subscribe((result) => {
  console.log("Persistent query result:", result);
});
```

The persistentQuery method returns an observable that emits the cached result immediately if available. It then continues to emit new results whenever the cache entry changes, either due to a new query or a manual cache mutation.

How to migrate
If you have existing code that manually handles cache updates and re-subscribes to queries, you can migrate to the persistentQuery method by replacing the manual logic with a call to persistentQuery.

For example, if you had code like this:

```ts
const query$ = query.query({ id: "123" });
const subscription = query$.subscribe((result) => {
  // Handle result
});

// Manually handle cache updates
query.onMutate((event) => {
  if (event.detail.current?.key === "cacheKeyFor123") {
    subscription.unsubscribe();
    const newSubscription = query.query({ id: "123" }).subscribe((result) => {
      // Handle result
    });
  }
});
```

You can replace it with the following:

```ts
const persistentQuery$ = query.persistentQuery({ id: "123" });
const subscription = persistentQuery$.subscribe((result) => {
  // Handle result
});
```

The persistentQuery method handles the cache updates automatically, eliminating the need for manual logic and re-subscriptions.

**Additional notes**

The persistentQuery method uses the distinctUntilChanged operator to only emit new results when the cache entry's transaction or mutation status changes, reducing unnecessary emissions.
If you need to customize the cache validation logic for the persistentQuery, you can pass a custom validate function in the cache options object, similar to the existing query method.
The persistentQuery method internally uses the \_query and #generateCacheKey methods from the Query class, ensuring consistent behavior with the existing query functionality.

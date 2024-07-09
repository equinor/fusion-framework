---
'@equinor/fusion-query': minor
---

A new public method `generateCacheKey` has been added to the `Query` class. This method allows users to generate a cache key based on provided query arguments, which can be useful for advanced caching scenarios or debugging.

```typescript
const query = new Query<YourDataType, YourArgsType>({
    /* ... */
});
const args = {
    /* your query arguments */
};
const cacheKey = query.generateCacheKey(args);
console.log('Generated cache key:', cacheKey);
```

**Enhanced mutate method**
The mutate method of the Query class now accepts an optional options parameter, allowing for more flexible cache mutations.

**New allowCreation option**
You can now specify whether to allow the creation of a new cache entry if it doesn't exist when performing a mutation.

```ts
const query = new Query<YourDataType, YourArgsType>({
    /* ... */
});

// Mutate existing cache entry or create a new one if it doesn't exist
query.mutate(args, (prevState) => ({ ...prevState, newProperty: 'value' }), {
    allowCreation: true,
});
```

**Changes to internal cache handling**
The internal QueryCache class has been updated to support the new allowCreation option. This change allows for more flexible cache management, especially when dealing with non-existent cache entries.

**Breaking change**
The mutate method will now throw an error if the cache entry doesn't exist and allowCreation is not explicitly set to true. This change ensures more predictable behavior and helps prevent accidental cache entry creation.

```ts
// This will throw an error if the cache entry doesn't exist
query.mutate(args, changes);

// This will create a new cache entry if it doesn't exist
query.mutate(args, changes, { allowCreation: true });
```

**How to update**
If you're relying on the mutate method to create new cache entries, update your code to explicitly set allowCreation: true:

```ts
query.mutate(args, changes, { allowCreation: true });
```

Review your codebase for any uses of mutate that might be affected by the new error-throwing behavior when the cache entry doesn't exist.

If you need to generate cache keys for advanced use cases, you can now use the generateCacheKey method:

```ts
const cacheKey = query.generateCacheKey(args);
```

These changes provide more control over cache manipulation and help prevent unintended side effects when working with the Query class.

---
'@equinor/fusion-query': minor
---

added functionality for invalidate cache records

## example

### Step 1: Define the Fetch Function

Assuming a function `fetchUserProfile(userId: string)` that fetches user profile data, ensure it's implemented. This function is crucial as it serves as the data source that the `Query` class will use.

### Step 2: Instantiate `Query` for User Profiles

You need to create an instance of your `Query` class specifically for fetching and caching user profiles. The instantiation should include specifying how to generate cache keys and, potentially, how cache validation should work.

```typescript
type UserProfileArgs = {
    userId: string;
};

const userProfileQuery = new Query<UserProfile, UserProfileArgs>({
    client: {
        fn: fetchUserProfile,
    },
    key: (args) => `userProfile_${args.userId}`,
});
```

### Step 3: Execute the Query to Populate the Cache

Use the `query` or `queryAsync` method to fetch the user profile for the user with id `1` and automatically populate the cache. Let's assume we prefer the asynchronous version for immediate use:

```typescript
async function initializeUserProfileCache() {
    try {
        const userProfileData = await userProfileQuery.queryAsync({ userId: '1' });
        console.log('UserProfile Data:', userProfileData);
    } catch (error) {
        console.error('Failed to fetch user profile data:', error);
    }
}
```

The `initializeUserProfileCache` function is an asynchronous function that attempts to fetch the user profile using the `queryAsync` method and logs the data to the console. This function populates the cache with the fetched user profile data, ready for subsequent accesses via the cache without needing to refetch the data.

### Listening to Cache Invalidation Events

To react to cache invalidation events (not part of the initial population but useful for cache management), use the `onInvalidate` method:

```typescript
userProfileQuery.onInvalidate((event) => {
    if (event.detail.item) {
        console.log(`Cache entry invalidated for user: ${event.detail.item.value.id}`);
    } else {
        console.log('Cache invalidated for all users');
    }
});
```

### Invalidating the Cache

When you want to invalidate the cache, either for specific user profiles or entirely, utilize the `invalidate` method:

```typescript
// Invalidate cache for a specific user profile
userProfileQuery.invalidate({ userId: '1' });

// Invalidate the entire cache
userProfileQuery.invalidate();
```

In summary, these steps outline how to use your `Query` class to fetch, cache, and manage user profile data effectively. Starting with fetching and caching data for a user with id `1`, handling cache invalidation events, to invalidating cache entries as needed.

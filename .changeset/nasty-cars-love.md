---
'@equinor/fusion-query': minor
---

Added functionality for mutating a cached value

## example

### Setting up the User Profile Scenario

First, assume we have a user profile query setup similar to the previous explanation:

```typescript
// Define the structure of a user profile and the arguments to identify a specific profile
type UserProfile = {
    id: string;
    name: string;
    email: string;
    bio?: string;
};

type UserProfileArgs = {
    userId: string;
};

// Example Query: Initialized elsewhere, assume it's the instance of the enhanced Query class
declare const userProfileQuery: Query<UserProfile, UserProfileArgs>;
```

### Using `onMutate` to Listen for Mutations

Now, let’s listen to the `onMutate` event on our `userProfileQuery`. We want to log the change or potentially trigger a UI update whenever a user's profile cache entry is mutated.

```typescript
// Subscribing to mutation events for the user profile query
const unsubscribeOnMutate = userProfileQuery.onMutate(({ detail }) => {
    const { changes, current } = detail;

    // Assuming changes are direct object updates and current is the state prior to applying changes in this example
    console.log('Mutation occurred on user profile:', changes);

    if (current) {
        console.log('Previous state of the profile:', current);
    }

    // Here you could trigger a UI update or any other side effects needed after a mutation
    // For instance:
    // updateUI(current?.value, changes); // Hypothetical function to update UI
});

// Remember to call `unsubscribeOnMutate` to clean up when the component or application no longer needs to listen for these events
// unsubscribeOnMutate();
```

### Mutating the Cache Entry

To trigger this `onMutate` event, somewhere in your application, you might mutate the cache entry for a user profile after an action, such as the user updating their profile:

```typescript
// Args identifying the specific user profile cache entry to mutate
const JoshProfileArgs = { userId: '1' };

// Assuming a simple update to the users bio
const updateBioChangeFn = (currentUserProfile: UserProfile) => ({
    ...currentUserProfile,
    bio: 'Updated bio information.',
});

// Perform cache entry mutation
userProfileQuery.mutate(JoshProfileArgs, updateBioChangeFn);
```

This mutation operation would then trigger the `onMutate` listener we set up earlier, logging the changes and potentially updating the UI or triggering other side effects.

### Conclusion

The `onMutate` functionality in the `Query` class provides a powerful way to react to cache mutations, making it useful for keeping the UI in sync with the latest data changes or for logging and debugging purposes. Always ensure to unsubscribe from events when they are no longer needed to prevent memory leaks and unintended side effects.

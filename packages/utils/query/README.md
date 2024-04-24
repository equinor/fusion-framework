## Use Case

The primary use case for `Query` involves:

-   **Asynchronous Data Fetching**: Seamlessly fetching data from APIs or databases asynchronously without blocking the UI, improving the user experience.
-   **State Management for Remote Data**: Managing the state of remote data, including loading states, error states, and the data itself, in a concise and scalable manner.
-   **Caching**: Storing fetched data in a cache to improve performance by reducing the number of redundant requests to the server.
-   **Automatic Updates**: Automatically updating the UI when the underlying data changes, without requiring explicit refresh actions from the user.
-   **Concurrent Requests Management**: Efficiently handling multiple, concurrent data fetches through strategies like merging, switching, or concatenating requests.
-   **Retry and Error Handling**: Automatically retrying failed requests and handling errors gracefully to ensure application stability.

## Benefits

Using a `Query` mechanism offers numerous benefits, including:

1. **Improved Performance and Efficiency**: By caching responses and reducing unnecessary server requests, applications load faster and use fewer resources, both on the client and server side.
2. **Simplified Data Fetching Logic**: It abstracts away the boilerplate code associated with fetching data, handling errors, and managing response states, leading to cleaner and more maintainable code.
3. **Automatic Synchronization**: `Query` libraries often come with features to automatically refetch data on certain triggers (e.g., window focus), ensuring the UI is always up-to-date with the latest server state without manual intervention.
4. **Built-in Asynchronous Management**: Handling asynchronous data fetches becomes straightforward, with built-in support for loading states, error handling, and data updates.
5. **Scalability**: Easily scalable for complex applications, supporting various fetching strategies to manage multiple data sources, endpoints, and concurrent requests effectively.
6. **Developer Experience**: By standardizing the approach to data fetching and state management, it enhances developer experience, reducing the cognitive load and making it easier to onboard new developers.
7. **Robust Error and Retry Handling**: Features to automatically retry requests and sophisticated mechanisms for error handling improve application reliability.
8. **Customizable and Extendable**: While offering sensible defaults for most use cases, `Query` implementations are usually highly customizable, allowing developers to tailor their behavior for specific needs, such as custom caching strategies, query deduplication, and more.

## Configuration

When setting up a `Query`, you can typically configure it with several options to tailor its behavior to your application's specific needs. While the exact options available can vary depending on the implementation of the `Query`, common configuration parameters often include:

1. **`fn` (Function):**

    - This is the core function that the client will use to fetch data. It receives the querying arguments and returns a promise which resolves with the fetched data. Ideally, this function encapsulates your API call, utilizing `fetch`, Axios, or any other HTTP client.

2. **Retry Strategy:**

    - Options to configure how the client should behave in the event of a failed request. This could include the maximum number of retries, the conditions under which a retry should occur, and the delay between retries.

3. **Caching Strategy:**

    - Defines how and what the client should cache. This could include:
        - **`expire`**: Time in milliseconds after which a cached item is considered stale.
        - **Custom cache keys**: A function to generate unique cache keys based on query arguments.
        - **Cache validation**: Function to determine if cached data is still valid based on custom logic.

4. **Concurrent Request Handling (Queuing Strategy):**

    - Determines how the client manages simultaneous requests. Common strategies might include:
        - **`switch`**: Cancels any ongoing request when a new request comes in.
        - **`merge`**: Allows multiple requests to run in parallel.
        - **`concat`**: Queues requests and executes them sequentially.

5. **Logging / Debugging:**

    - Integrations or options for logging queries, responses, and errors for debugging purposes. This might include specifying a logger instance or configuring log levels.

6. **Request Transformation:**

    - Functions to modify requests before they are sent. This could be used to add authorization headers, manipulate query parameters, or transform request bodies.

7. **Response Transformation:**

    - Similarly, functions to process data before it's handed off to your application code. This could involve shaping the response data or extracting relevant parts of it.

8. **Error Handling:**

    - Strategies to handle errors globally, such as transforming error responses or triggering global error states.

9. **`signal` (AbortSignal):**

    - Support for passing an `AbortSignal` to requests, allowing you to cancel them programmatically if needed.

10. **Extended Configuration:**
    - Depending on the specific implementation, there may be additional options to tweak the client's internals, such as modifying timeout durations, setting base URLs for requests, or configuring default headers.

### Example of a Basic QueryClient Setup

```javascript
const queryClient = new QueryClient({
    fn: async (args) => {
        const response = await fetch(`https://your.api/${args.endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args.params),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    },
    expire: 60000, // Cache data expires after 60 seconds
    retry: { attempts: 3, delay: 1000 }, // Retry up to 3 times, 1 second apart
    // Additional config options as necessary...
});
```

#### Observable

```typescript
const args = {
    /* your query arguments here */
};
query.query(args).subscribe({
    next: (result) => console.log(result),
    error: (error) => console.error(error),
    complete: () => console.log('Query completed'),
});
```

#### Asynchronous

```typescript
const args = {
    /* your query arguments here */
};
query
    .queryAsync(args)
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
```

### Managing Cache

#### Mutation

```typescript
const args = {
    /* identify cache entry */
};
const changes = (prevState) => ({ ...prevState /* new state changes */ });
query.mutate(args, changes);
```

#### Direct Cache Update (Optimistic Update)

If you're confident about the new state of the data after the mutation, you can apply an optimistic update:

```javascript
// Assume a function to update a post returns the updated post data
async function updatePost(postId, newData) {
  const updatedPost = await apiUpdatePost(postId, newData); // perform API request to update the post
  return updatedPost;
}

// Optimistically updating the cache with the new post data
fastQueryClient.mutate(['post', postId], async (oldData) => {
  const updatedData = await updatePost(postId, newData);
  return { ...oldData, ...updatedData, updated: Date.now() };
});
```

In this case, by providing the `updated` attribute with the current timestamp, FastQuery knows that the cached data is fresh, preventing unnecessary refetches.

#### Marking Cache As Stale

If the final state of the data after the mutation is uncertain or if it's preferable for the application to fetch fresh data from the server, you can choose to invalidate the cache item:

```javascript
// Invalidate the cache item for the post, forcing a refetch next time
fastQueryClient.mutate(['post', postId], oldData => {
  // Perform the mutation without directly updating the cache data
  updatePost(postId, newData);
  
  // Return null or undefined, or simply omit the updated attribute
  // This marks the cache item as stale
  return { ...oldData, updated: undefined }; // Omitting or setting undefined explicitly
});
```

#### Invalidation

Invalidate a specific cache entry or all:

```typescript
query.invalidate(args); // Invalidates specific entry
query.invalidate(); // Invalidates all cache entries
```

### Subscriptions and Cleanup

Remember to unsubscribe from observables or to complete the query to release resources:

```typescript
const subscription = query.query(args).subscribe((result) => console.log(result));
// Later, when you're done:
subscription.unsubscribe();

// Or, to complete and clean up the query itself:
query.complete();
```

## Advanced Usage

### Queue Operators

The Query utility allows you to manage concurrent requests using different queue strategies: `switch`, `merge`, and `concat`. Here's how you can apply each strategy:

#### Switch (Default)

Cancels the current active request when a new request comes in. Only the result from the latest request will be returned.

```typescript
import { Query } from '@equinor/fusion-query';
import { debounceTime, fromEvent, map, switchMap } from 'rxjs';

// Mock function to simulate data fetching based on the search query
async function fetchSearchResults(searchQuery: string) {
    const response = await fetch(`https://your.api/search?query=${searchQuery}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Define the query with the switch as a debounce strategy
const searchQuery = new Query<any, { searchQuery: string }>({
    client: {
        fn: ({ searchQuery }) => fetchSearchResults(searchQuery),
    },
    key: ({ searchQuery }) => `search-${searchQuery}`,
    queueOperator: 'switch',
});
```

#### Set Up the Event Listener on the Search Input

Now, set up the search input to listen for changes and use the defined query to fetch data:

```typescript
const searchInput = document.getElementById('search-input');

fromEvent(searchInput, 'input')
    .pipe(
        map((event) => (event.target as HTMLInputElement).value),
        debounceTime(300), // Debounce typing to limit queries
        switchMap((searchQuery) => (searchQuery ? searchQuery.query({ searchQuery }) : [])),
    )
    .subscribe({
        next: (results) => {
            console.log('Search Results:', results);
            // Handle rendering the search results here
        },
        error: (error) => console.error('Error fetching search results:', error),
    });
```

#### Merge

Allows multiple requests to run in parallel without canceling each other. All responses will be returned as they arrive.

```typescript
async function fetchData(endpoint: string, queryParams: object) {
    const response = await fetch(`https://your.api/${endpoint}`, {
        method: 'GET',
        body: JSON.stringify(queryParams),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}
```

```typescript
import { Query } from '@equinor/fusion-query';
import { combineLatest } from 'rxjs';

// Defining the query with `fn` function for client creation
const userProfileQuery = new Query<any, { endpoint: string; queryParams: object }>({
    client: {
        fn: fetchData,
    },
    key: (args) => `${args.endpoint}-${JSON.stringify(args.queryParams)}`,
    queueOperator: 'merge', // Using merge to handle parallel queries
});

const userId = 'exampleUserId';

// Initiating parallel requests
const userDetails$ = userProfileQuery.query({ endpoint: 'users', queryParams: { userId } });
const userPosts$ = userProfileQuery.query({ endpoint: 'posts', queryParams: { userId } });
const userComments$ = userProfileQuery.query({ endpoint: 'comments', queryParams: { userId } });

// Combining the observables from parallel requests
combineLatest([userDetails$, userPosts$, userComments$]).subscribe({
    next: ([userDetails, userPosts, userComments]) => {
        // Handle and display the combined data as needed
        console.log('User Details:', userDetails);
        console.log('User Posts:', userPosts);
        console.log('User Comments:', userComments);
    },
    error: (error) => console.error('Error fetching data:', error),
    complete: () => console.log('All parallel queries completed'),
});
```

#### Concat

Queues requests and executes them one after another in a sequential manner. A new request will only start after the previous one has completed.

```typescript
const query = new Query<YourDataType, YourArgsType>({
    client,
    key: (args) => JSON.stringify(args),
    queueOperator: 'concat',
});
```

### Cache Validation Strategies

Cache validation is crucial for determining whether cached data is still relevant or needs to be refreshed. You can customize cache validation using the `validate` option.

#### Default Expiration Time

Automatically consider cache entries as stale after a specified duration.

```typescript
const query = new Query<YourDataType, YourArgsType>({
    client,
    key: (args) => JSON.stringify(args),
    expire: 60000, // 60 seconds
});
```

#### Custom Validation Function

Implement a custom logic to validate cache entries based on your requirements.

```typescript
const query = new Query<YourDataType, YourArgsType>({
    client,
    key: (args) => JSON.stringify(args),
    validate: (entry, args) => {
        // Your custom validation logic here.
        // For example, return `false` if the entry is older than 30 minutes.
        return Date.now() - entry.updated < 30 * 60 * 1000;
    },
});
```

### Setting Up Shared QueryCache and Data Fetch Function

First, establish a shared `QueryCache` instance and define a common function to fetch data. This shared cache will be utilized by different query instances across the application.

```javascript
import { Query, QueryCache } from '@equinor/fusion-query';

// Initialize a shared QueryCache across the application
const sharedQueryCache = new QueryCache();

// Function to fetch blog posts data from your API
async function fetchBlogPosts() {
  const response = await fetch('https://example.com/api/blog-posts');
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  return response.json();
}
```

Next, directly initialize separate `Query` instances in different parts of your application (e.g., for homepage posts and sidebar posts). These instances will share the same `QueryCache` but are created independently.

```javascript
// Create a Query instance for the homepage using the shared cache
const homepagePostsQuery = new Query({
  client: {
    fn: fetchBlogPosts,
  },
  cache: sharedQueryCache, // Utilize the shared cache
  key: () => 'allBlogPosts', // Unique key for this query
});

// Fetch and render posts on the homepage
homepagePostsQuery.query().subscribe({
  next: (posts) => {
    // Render posts on the homepage
    console.log('Homepage posts:', posts);
  },
  error: (error) => console.error('Error fetching posts for homepage:', error),
});
```

```javascript
// Create a Query instance for the sidebar using the same shared cache
const sidebarPostsQuery = new Query({
  client: {
    fn: fetchBlogPosts,
  },
  cache: sharedQueryCache,
  key: () => 'allBlogPosts', // Same key, leveraging cache from homepage query
});

// Fetch and display posts in the sidebar widget
sidebarPostsQuery.query().subscribe({
  next: (posts) => {
    // Render posts in the sidebar
    console.log('Sidebar posts:', posts);
  },
  error: (error) => console.error('Error fetching posts for sidebar:', error),
});
```

Since both `homepagePostsQuery` and `sidebarPostsQuery` instances use the shared `QueryCache`, fetching operations benefit from cache-first strategies, reducing unnecessary network requests. 

- If `"allBlogPosts"` data is fetched first by the homepage and then requested by the sidebar, the sidebar will immediately access the cached data without needing to fetch from the network again.
- Any updates to the cache by one query instance (either from fetching new data or manually updating the cache entries) are immediately available to the others, given they share the same cache and cache keys.


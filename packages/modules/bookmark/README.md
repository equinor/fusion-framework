# Bookmark Module

The Bookmark module provides a way to manage bookmarks in the application. It allows users to create, update, and remove bookmarks, as well as manage the current bookmark and the list of bookmarks.

## Features

- **Create, update, and delete bookmarks**
- **Manage current bookmark**
- **Add and remove bookmarks from favorites**
- **Event listeners for bookmark-related events**

## Setup

```bash
pnpm install @equinor/fusion-framework-module-bookmark
```

```ts
import { enableBookmarkModule } from ' @equinor/fusion-framework-module-bookmark'
const configure = (configurator) => {
  // simplest setup
  enableBookmarkModule(configurator);
}
```

## Configuration
```ts
/** example of configuration */
enableBookmarkModule(configurator, async(builder) => {
    /** Set source system of bookmark, note used for queries and creation */
    builder.setSourceSystem({
        id: 'source-system-id',
        name: 'Source System Name',
    });

    /** apply filters for current application */
    builder.setFilter('application', true);

    /** apply filters for current context */
    builder.setFilter('context', true);

    /** === Advance Configuration === */

    /** override default implementations */
    builder.setClient(/** custom client implementation */)
    builder.setParent(/** custom parent implementation */)

    /** override default resolvers */
    builder.setContextResolver(/** custom context resolver implementation */)
    builder.setApplicationResolver(/** custom application resolver implementation */)
});
```


## BookmarkProvider

The `BookmarkProvider` class is responsible for managing bookmarks in the application. It provides methods for creating, updating, and removing bookmarks, as well as managing the current bookmark and the list of bookmarks.



### Usage


#### Creating a Bookmark

To create a new bookmark, use the `createBookmark` method:

```ts
const newBookmark = {
    name: 'My Bookmark',
    payload: { /* Your bookmark data */ },
};

bookmarkProvider.createBookmark(newBookmark).subscribe({
    next: (bookmark) => {
        console.log('Bookmark created:', bookmark);
    },
    error: (err) => {
        console.error('Failed to create bookmark:', err);
    },
});
```


#### Updating a Bookmark

To update an existing bookmark, use the `updateBookmark` method:

```ts
const bookmarkId = 'bookmark-id';
const bookmarkUpdates = {
    name: 'Updated Bookmark Name',
    payload: { /* Updated bookmark data */ },
};

bookmarkProvider.updateBookmark(bookmarkId, bookmarkUpdates).subscribe({
    next: (updatedBookmark) => {
        console.log('Bookmark updated:', updatedBookmark);
    },
    error: (err) => {
        console.error('Failed to update bookmark:', err);
    },
});
```

#### Using payload generator

Callback function which triggers on creation or update of bookmark. It is used to modify the payload of the bookmark.

- payload: The payload of the bookmark, which can be modified of other payload generators.
- initial: The initial payload of the bookmark, which is the payload of the bookmark before any payload generators have been applied.

```ts
const bookmarkPayloadGenerator = (payload, initial) => {
    payload.counter = payload.counter ?? 0 + initial.counter;
};
```

#### Removing a Bookmark

To remove a bookmark, use the `removeBookmark` method:

```ts
const bookmarkId = 'bookmark-id';

bookmarkProvider.removeBookmark(bookmarkId).subscribe({
    next: (result) => {
        console.log('Bookmark removed:', result);
    },
    error: (err) => {
        console.error('Failed to remove bookmark:', err);
    },
});
```


#### Managing Favorites

To add a bookmark to favorites, use the `addBookmarkToFavorites` method:

```ts
const bookmarkId = 'bookmark-id';

bookmarkProvider.addBookmarkToFavorites(bookmarkId).subscribe({
    next: (bookmark) => {
        console.log('Bookmark added to favorites:', bookmark);
    },
    error: (err) => {
        console.error('Failed to add bookmark to favorites:', err);
    },
});
```


To check if a bookmark is in favorites, use the `isBookmarkInFavorites` method:

```ts
const bookmarkId = 'bookmark-id';

bookmarkProvider.isBookmarkInFavorites(bookmarkId).subscribe({
    next: (isFavorite) => {
        console.log('Is bookmark in favorites:', isFavorite);
    },
    error: (err) => {
        console.error('Failed to check if bookmark is in favorites:', err);
    },
});
```


#### Event Listeners

You can register event listeners for various bookmark-related events:

```ts
const removeListener = bookmarkProvider.on('onCurrentBookmarkChanged', (event) => {
    console.log('Current bookmark changed:', event.detail);
});

// To remove the event listener
removeListener();
```

## Client

The `BookmarkClient` class is responsible for fetching bookmarks from the source system. It provides methods for fetching bookmarks by ID, fetching bookmarks by query, and fetching the current bookmark. This is the default implementation of the client and created if not overridden in the configuration.

```ts
/** Example usage with BookmarkClient as stand alone */
import { BookmarkClient } from '@equinor/fusion-bookmark';
import { BookmarksApiClient } from '@equinor/fusion-framework-module-services/bookmarks';
import { HttpClient } from '@equinor/fusion-framework-module-http/client';

const httpClient = new HttpClient('https://my-fusion-backend-url.com');
const apiClient = new BookmarksApiClient(httpClient, 'json$');
const client = new BookmarkClient(apiClient);

client.getAllBookmarks().subscribe(bookmarks => {
    // do something with bookmarks
});

client.getBookmarkById('bookmark-id').subscribe(bookmark => {
// do something with bookmark
});
```

### Custom Client

By implementing the `IBookmarkClient` interface, you can create a custom client implementation.

```typescript
import { IBookmarkClient } from '@equinor/fusion-bookmark';

export class CustomBookmarkClient implements IBookmarkClient {
    // Implement the interface methods
}

const configure = (configurator) => {
    enableBookmarkModule(configurator, async(builder) => {
        builder.setClient(new CustomBookmarkClient());
    });
};
```


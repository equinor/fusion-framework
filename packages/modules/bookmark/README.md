# Bookmark Module

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

## BookmarkProvider

The `BookmarkProvider` class is responsible for managing bookmarks in the application. It provides methods for creating, updating, and removing bookmarks, as well as managing the current bookmark and the list of bookmarks.

### Features

- **Create, update, and delete bookmarks**
- **Manage current bookmark**
- **Add and remove bookmarks from favorites**
- **Event listeners for bookmark-related events**

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

# Bookmarks API Module

This module provides a set of services and utilities to manage user bookmarks. It allows for creating, reading, updating, and deleting bookmarks, ensuring that users can easily save and retrieve their favorite or frequently accessed items. The module is designed to be flexible and scalable, supporting various types of bookmarks and integrating seamlessly with other parts of the application.

## Features
- **Create Bookmarks**: Create new bookmarks with custom payloads.
- **Retrieve Bookmarks**: Fetch individual bookmarks or all bookmarks.
- **Update Bookmarks**: Update existing bookmarks with new data.
- **Delete Bookmarks**: Remove bookmarks by their ID.
- **Manage Favorites**: Add or remove bookmarks from the user's favorites.
- **Bookmark Payloads**: Retrieve and manage bookmark payloads.

## Usage

### Creating a Bookmarks API Client
To create an instance of the `BookmarksApiClient`, you need to provide an HTTP client and specify the method for API requests.


```typescript
import { BookmarksApiClient } from '@equinor/fusion-framework-module-services';
import { HttpClient } from 'your-http-client-library';

// Create an instance of the HTTP client
const httpClient = new HttpClient();

// Create an instance of the BookmarksApiClient
const bookmarksClient = new BookmarksApiClient(httpClient, 'json');
```

### Fetching All Bookmarks
You can fetch all bookmarks using the `getAll` method.

```typescript
const allBookmarks = await bookmarksClient.getAll('v1');
console.log(allBookmarks);
```

### Creating a Bookmark
To create a new bookmark, use the `create` method.

```typescript
const newBookmark = await bookmarksClient.create('v1', {
    name: 'My Bookmark',
    description: 'A description for my bookmark',
    isShared: true,
    payload: { key: 'value' },
});
console.log(newBookmark);
```

### Updating a Bookmark
To update an existing bookmark, use the `patch` method.

```typescript
const updatedBookmark = await bookmarksClient.patch('v1', {
    bookmarkId: 'bookmark-id',
    data: {
        name: 'Updated Bookmark Name',
        payload: { key: 'new value' },
    }
});
console.log(updatedBookmark);
```

### Deleting a Bookmark
To delete a bookmark by its ID, use the `delete` method.

```typescript
const deletedBookmarkId = await bookmarksClient.delete('v1', { bookmarkId: 'bookmark-id' });
console.log(`Deleted bookmark with ID: ${deletedBookmarkId}`);
```

### Managing Bookmark Favorites
You can add or remove bookmarks from the user's favorites.

```typescript
// Add to favorites
await bookmarksClient.addFavourite('v1', { bookmarkId: 'bookmark-id' });

// Remove from favorites
await bookmarksClient.removeFavorite('v1', { bookmarkId: 'bookmark-id' });
```

### Fetching a Bookmark Payload
To fetch the payload of a specific bookmark, use the `getPayload` method.

```typescript
const bookmarkPayload = await bookmarksClient.getPayload('v1', { bookmarkId: 'bookmark-id' });
console.log(bookmarkPayload);
```

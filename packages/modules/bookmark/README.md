# Bookmark Module

`@equinor/fusion-framework-module-bookmark` provides bookmark management for Fusion Framework applications. It lets users **create, update, delete, and favourite bookmarks**, track a **current (active) bookmark**, and react to bookmark lifecycle events.

Under the hood the module uses an RxJS-based state store with side-effect flows, an API client backed by `@equinor/fusion-framework-module-services`, and an event system powered by `@equinor/fusion-framework-module-event`.

## Key Concepts

| Concept | Description |
| --- | --- |
| **BookmarkProvider** | Runtime service exposed after the module initialises. All CRUD, favourites, and current-bookmark operations go through this class. |
| **BookmarkModuleConfigurator** | Builder used during the configure phase to set the source system, filters, resolvers, and custom client. |
| **Payload Generator** | Callback registered via `addPayloadGenerator` that participates in building the bookmark payload during create and update. The callback receives an Immer draft — mutate in place. |
| **Source System** | Identifies which system owns the bookmarks (used for filtering and creation). |
| **Filters** | Optional flags (`application`, `context`) that restrict bookmark queries to the current app and/or context. |

## Installation

```bash
pnpm add @equinor/fusion-framework-module-bookmark
```

## Quick Start

The simplest setup — no custom configuration, inherits everything from the parent (e.g. the portal framework):

```ts
import { enableBookmark } from '@equinor/fusion-framework-module-bookmark';

const configure = (configurator) => {
  enableBookmark(configurator);
};
```

## Configuration

Use the callback form of `enableBookmark` to customise behaviour:

```ts
import { enableBookmark } from '@equinor/fusion-framework-module-bookmark';

const configure = (configurator) => {
  enableBookmark(configurator, (builder) => {
    // Tag bookmarks with their originating system
    builder.setSourceSystem({
      identifier: 'my-app-id',
      name: 'My Application',
    });

    // Only return bookmarks for the current application
    builder.setFilter('application', true);

    // Only return bookmarks for the current context
    builder.setFilter('context', true);
  });
};
```

### Advanced Configuration

```ts
enableBookmark(configurator, (builder) => {
  // Provide a custom API client (must implement IBookmarkClient)
  builder.setClient(myCustomClient);

  // Inherit bookmarks from a different parent provider
  builder.setParent(parentProvider);

  // Override how the current context is resolved
  builder.setContextResolver(async (init) => {
    return async () => ({ id: 'custom-context-id' });
  });

  // Override how the current application is resolved
  builder.setApplicationResolver(async (init) => {
    return async () => ({ appKey: 'my-app' });
  });
});
```

> [!NOTE]
> When no explicit configuration is provided, the configurator resolves values
> from the parent framework (portal) and falls back to defaults for:
> - Source system
> - Filters
> - Context resolver
> - Application resolver

## BookmarkProvider

`BookmarkProvider` is the runtime service you interact with after the module is initialised. It exposes both **Observable** and **async/Promise** APIs for every operation.

### Creating a Bookmark

```ts
bookmarkProvider.createBookmark({
  name: 'My Bookmark',
  payload: { filters: { status: 'active' } },
}).subscribe({
  next: (bookmark) => console.log('Created:', bookmark.id),
  error: (err) => console.error('Create failed:', err),
});

// Or with async/await:
const bookmark = await bookmarkProvider.createBookmarkAsync({
  name: 'My Bookmark',
  payload: { filters: { status: 'active' } },
});
```

### Updating a Bookmark

```ts
bookmarkProvider.updateBookmark('bookmark-id', {
  name: 'Updated Name',
  payload: { filters: { status: 'closed' } },
}).subscribe({
  next: (updated) => console.log('Updated:', updated.id),
  error: (err) => console.error('Update failed:', err),
});
```

### Deleting a Bookmark

```ts
bookmarkProvider.deleteBookmark('bookmark-id').subscribe({
  next: () => console.log('Deleted'),
  error: (err) => console.error('Delete failed:', err),
});
```

### Payload Generators

Register a callback that runs during create and update to build or transform the bookmark payload. The callback receives an **Immer draft** — mutate it in place:

```ts
const unregister = bookmarkProvider.addPayloadGenerator((payload, initial) => {
  // `payload` is an Immer draft — mutate directly
  payload.savedAt = new Date().toISOString();
  payload.counter = (initial?.counter ?? 0) + 1;
});

// Call unregister() when the component unmounts to remove the generator
```

`canCreateBookmarks` returns `true` only when at least one payload generator is registered.

### Current Bookmark

Set, observe, or clear the active bookmark:

```ts
// Set current bookmark by ID (fetches full data automatically)
bookmarkProvider.setCurrentBookmark('bookmark-id').subscribe();

// Clear the current bookmark
bookmarkProvider.setCurrentBookmark(null).subscribe();

// Observe changes
bookmarkProvider.currentBookmark$.subscribe((bookmark) => {
  console.log('Active bookmark:', bookmark);
});
```

### Favourites

```ts
// Add to favourites
bookmarkProvider.addBookmarkToFavorites('bookmark-id').subscribe();

// Remove from favourites
bookmarkProvider.removeBookmarkAsFavorite('bookmark-id').subscribe();

// Check favourite status
bookmarkProvider.isBookmarkInFavorites('bookmark-id').subscribe((isFav) => {
  console.log('Is favourite:', isFav);
});
```

### Event Listeners

Subscribe to lifecycle events emitted by the provider:

```ts
const unsubscribe = bookmarkProvider.on('onCurrentBookmarkChanged', (event) => {
  console.log('Current bookmark changed:', event.detail);
});

// Call unsubscribe() to remove the listener
```

Available events:

| Event | When it fires |
| --- | --- |
| `onCurrentBookmarkChange` | **Before** the current bookmark changes (cancelable) |
| `onCurrentBookmarkChanged` | **After** the current bookmark has changed |
| `onBookmarkCreate` | Before a bookmark is created (cancelable) |
| `onBookmarkCreated` | After a bookmark has been created |
| `onBookmarkUpdate` | Before a bookmark is updated (cancelable) |
| `onBookmarkUpdated` | After a bookmark has been updated |
| `onBookmarkDelete` | Before a bookmark is deleted (cancelable) |
| `onBookmarkDeleted` | After a bookmark has been deleted |
| `onBookmarkFavouriteAdd` | Before a bookmark is added to favourites (cancelable) |
| `onBookmarkFavouriteAdded` | After a bookmark has been added to favourites |
| `onBookmarkFavouriteRemove` | Before a bookmark is removed from favourites (cancelable) |
| `onBookmarkFavouriteRemoved` | After a bookmark has been removed from favourites |
| `onBookmarkPayloadCreatorAdded` | When a new payload generator is registered |

## Custom Bookmark Client

To use a different backend, implement the `IBookmarkClient` interface and pass it to the configurator:

```ts
import type { IBookmarkClient } from '@equinor/fusion-framework-module-bookmark';

const myClient: IBookmarkClient = {
  getAllBookmarks: (filter) => { /* ... */ },
  getBookmarkById: (id) => { /* ... */ },
  getBookmarkData: (id) => { /* ... */ },
  setBookmarkData: (id, data) => { /* ... */ },
  createBookmark: (bookmark) => { /* ... */ },
  updateBookmark: (id, updates) => { /* ... */ },
  deleteBookmark: (id) => { /* ... */ },
  addBookmarkToFavorites: (id) => { /* ... */ },
  removeBookmarkFromFavorites: (id) => { /* ... */ },
  isBookmarkFavorite: (id) => { /* ... */ },
};

enableBookmark(configurator, (builder) => {
  builder.setClient(myClient);
});
```

## Error Handling

The module exposes two error classes:

- **`BookmarkProviderError`** — thrown by `BookmarkProvider` methods when a high-level operation fails (e.g. timeout, cancelled event, resolution failure).
- **`BookmarkFlowError`** — thrown inside internal store flows when an API call fails. Carries a reference to the originating request action.

Errors are also collected in the store and accessible via `bookmarkProvider.errors$`.

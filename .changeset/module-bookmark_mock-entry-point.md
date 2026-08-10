---
"@equinor/fusion-framework-module-bookmark": minor
---

Add a purpose-built mock, exported from a new `/mock` subpath (`@equinor/fusion-framework-module-bookmark/mock`).

`enableBookmarkMock` swaps in an in-memory `IBookmarkClient` behind the real `BookmarkModuleConfigurator`, `BookmarkProvider`, and store flows — create, update, delete, and favourite calls all reach the mock client through the real flow logic, not a stand-in. `BookmarkMockConfigurator` adds a bookmark-domain vocabulary for seeding state:

```typescript
import { enableBookmarkMock } from '@equinor/fusion-framework-module-bookmark/mock';

enableBookmarkMock(configurator, (builder) => {
  builder.setBookmarks([{ id: 'bookmark-1', name: 'My Bookmark', appKey: 'my-app', payload: {} }]);
  builder.setCurrentBookmark('bookmark-1');
  builder.setFavorite('bookmark-1', true);
});
```

The whole real builder API stays available, including `setClient`, so an explicit call to it still replaces the mock client outright. When no real `app`/`context` module is registered alongside the mock, `resolve.application`/`resolve.context` fall back to trivial resolvers automatically, since the module's config schema requires both.

Related: equinor/fusion-core-tasks#1667.

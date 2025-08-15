---
"@equinor/fusion-framework-module-bookmark": minor
"@equinor/fusion-framework-react-app": minor
---

Refactored the `Bookmark` type to be an intersection of `BookmarkWithoutData` and an optional `payload` property, improving type safety and flexibility. Updated `useCurrentBookmark` to use the new type and filter bookmarks by `appKey` matching the current app.

- Refactored `Bookmark` type in `packages/modules/bookmark/src/types.ts`
- Updated logic in `packages/react/app/src/bookmark/useCurrentBookmark.ts` to use new type and filter by appKey

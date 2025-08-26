---
"@equinor/fusion-framework-module-bookmark": minor
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-react-module-bookmark": patch
---

Refactored the `Bookmark` type to be an intersection of `BookmarkWithoutData` and an optional `payload` property, improving type safety and flexibility. Updated `useBookmarkNavigate` to use proper TypeScript typing for bookmark events.

**Module Bookmark Changes:**
- Refactored `Bookmark` type in `packages/modules/bookmark/src/types.ts`
- Added export for `BookmarkProviderEvents` type in `packages/modules/bookmark/src/index.ts`
- Updated JSDoc comment from `@note` to `@remarks` in `packages/modules/bookmark/src/BookmarkClient.ts`
- Reordered tsconfig references (event before services)

**React Changes:**
- Updated `packages/react/modules/bookmark/src/portal/useBookmarkNavigate.ts` to use proper TypeScript typing for bookmark provider events
- Removed React paths configuration from `packages/react/app/tsconfig.json`

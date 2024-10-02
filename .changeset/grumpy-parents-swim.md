---
'@equinor/fusion-framework-react-app': minor
---

Updated bookmark namespace in `@equinor/fusion-react-app` to include new hooks and updated `useCurrentBookmark` hook.

-   Updated `index.ts` to re-export everything from `@equinor/fusion-framework-react-module-bookmark` instead of individual exports.
-   Marked `useBookmark` as deprecated in `useBookmark.ts`.
-   Enhanced `useCurrentBookmark` in `useCurrentBookmark.ts` to accept a `BookmarkPayloadGenerator` and use the `BookmarkModule` from `useAppModule`.

**NOTE**: This change is backwards compatible and should not require any changes in consuming applications.
**NOTE**: `useBookmark` will be removed in the next major version. Please use providers and hooks from `@equinor/fusion-framework-react-module-bookmark` instead.

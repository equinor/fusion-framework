---
'@equinor/fusion-framework-cli': minor
---

Updated Bookmark Integration in Dev Portal

-   **Refactored `BookMarkSideSheet.tsx`:**

    -   Replaced `useHasBookmark` with `useCurrentAppModule<BookmarkModule>('bookmark')` for better module integration.
    -   Updated button `disabled` state to use `bookmarkProvider?.hasBookmarkCreators`.

-   **Updated `Header.tsx`:**

    -   Added `useCurrentAppModule<BookmarkModule>('bookmark')` to manage bookmark module state.
    -   Disabled bookmark button if `bookmarkProvider` is not available.
    -   Passed `bookmarkProvider` to `BookmarkProvider` component.

-   **Configuration Changes in `config.ts`:**
    -   Switched import from `@equinor/fusion-framework-module-bookmark` to `@equinor/fusion-framework-react-module-bookmark`.
    -   Added `builder.setFilter('application', true)` to bookmark configuration.

---
'@equinor/fusion-framework-react-components-bookmark': major
---

**@equinor/fusion-framework-react-module-bookmark:**

Updated the `Bookmark` component to use the `useBookmarkComponentContext` hook for accessing the bookmark provider and state.

-   Replaced the `useBookmark` hook with `useBookmarkComponentContext` in the `Bookmark` component.
-   Updated the `BookmarkProvider` component to use `createContext` and `useContext` for managing the bookmark provider state.
-   Modified the `CreateBookmarkModal` and `EditBookmarkModal` components to use the `useBookmarkComponentContext` hook.
-   Enhanced the `BookmarkProvider` component to include the current application context.
-   Improved error handling and loading state management in the `Bookmark` component.

---
'@equinor/fusion-framework-cookbook-app-react-bookmark': minor
---

Updated Bookmark Handling in App Component

-   Refactored `App.tsx` to use `useLayoutEffect` instead of `useEffect` for synchronizing the `payload` state with the current bookmark.
-   Replaced `useState` and `useCallback` with `useRef` for managing the `updateData` reference.
-   Simplified state management by removing `BookmarkState` and `init` and directly using `payload` state.
-   Updated input change handlers to directly update the `payload` state instead of using `updateState`.

Configuration Changes

-   Updated `config.ts` to enable the bookmark module using `enableBookmark`.
-   Removed unnecessary logger level settings and configuration callbacks for a cleaner setup.

---
'@equinor/fusion-framework-react-module-bookmark': minor
---

Added new hooks `useBookmarkProvider` and `useHasBookmark` with support for custom bookmark providers. This allows for more flexible bookmark management within the Fusion Framework React Bookmark Module.

Developers can now directly use `useBookmarkProvider` to get the bookmark provider instance and `useHasBookmark` to check if bookmark creators are present. This enhancement facilitates better integration with custom bookmark logic and improves the module's usability.

To adapt to these changes, consumers should consider utilizing the new hooks in their applications for enhanced bookmark management capabilities. Additionally, the removal of certain dependencies and the restructuring of `package.json` dependencies and peerDependencies sections should be noted and adjusted for in project setups.

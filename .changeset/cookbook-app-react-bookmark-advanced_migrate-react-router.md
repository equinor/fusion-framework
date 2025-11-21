---
"@equinor/fusion-framework-cookbook-app-react-bookmark-advanced": patch
---

Migrate cookbook from `@remix-run/router` to `@equinor/fusion-framework-react-router`.

Updated the bookmark-advanced cookbook to use the new React Router DSL API:
- Replaced `NavigationProvider.createRouter()` with `Router` component from `@equinor/fusion-framework-react-router`
- Migrated route definitions to use DSL functions (`layout`, `index`, `route`) from `@equinor/fusion-framework-react-router/routes`
- Added `Root.tsx` component using the new layout pattern
- Added `enableBookmark` configuration

This cookbook now serves as an example of the recommended routing pattern for Fusion Framework applications.


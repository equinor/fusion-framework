---
"@equinor/fusion-framework-cookbook-app-react-people": patch
---

Migrate cookbook from legacy router pattern to `@equinor/fusion-framework-react-router`.

Updated the people cookbook to use the new React Router DSL API:
- Removed `@remix-run/router` dependency
- Replaced `useRouter()` hook with `Router` component from `@equinor/fusion-framework-react-router`
- Migrated route definitions to use DSL functions (`layout`, `index`, `route`) from `@equinor/fusion-framework-react-router/routes`
- Updated page components to work with the new routing pattern

This cookbook now serves as an example of the recommended routing pattern for Fusion Framework applications.


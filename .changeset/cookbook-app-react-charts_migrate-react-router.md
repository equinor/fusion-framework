---
"@equinor/fusion-framework-cookbook-app-react-charts": patch
---

Migrate cookbook from legacy router pattern to `@equinor/fusion-framework-react-router`.

Updated the charts cookbook to use the new React Router DSL API:
- Replaced `useRouter()` hook with `Router` component from `@equinor/fusion-framework-react-router`
- Migrated route definitions to use DSL functions (`layout`, `index`, `route`, `prefix`) from `@equinor/fusion-framework-react-router/routes`
- Moved Root component to separate `pages/Root.tsx` file using the new layout pattern
- Simplified route structure using the DSL's `prefix` helper for nested routes

This cookbook now serves as an example of the recommended routing pattern for Fusion Framework applications.


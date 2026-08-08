---
"@equinor/fusion-framework-cookbook-app-react-state": patch
---

Internal: migrate routing to the Fusion route DSL (`layout`/`index`/`route` from `@equinor/fusion-framework-react-router/routes`), matching the pattern demonstrated in the router cookbook. Also fix the sidebar active-link check to match sub-paths (e.g. `/todos/*`) instead of only the exact page path.

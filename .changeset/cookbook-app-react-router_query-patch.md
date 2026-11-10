---
"@equinor/fusion-framework-cookbook-app-react-router": patch
---

Internal: bump `@tanstack/react-query` from 5.105.0 to 5.107.1 in the router cookbook's locked dependencies.

Internal: bump `@tanstack/react-query-devtools` from 5.105.0 to 5.106.1 in the router cookbook's locked development dependencies, aligning its query devtools with the installed React Query version.

The devtools panel now renders left-to-right regardless of page direction or browser language. React Query is updated alongside devtools to satisfy its matching peer requirement; no cookbook API migration is needed.

React Query 5.107.1 includes the query-core fix that keeps repeated selector-error timestamps stable. The existing devtools peer range accepts this version; no cookbook API migration is needed.

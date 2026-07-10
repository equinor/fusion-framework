---
"@equinor/fusion-framework-react-ag-grid": patch
---

Add a dedicated `react` subpath export that re-exports `ag-grid-react` symbols.
This lets consumers import the AG Grid React wrapper from `@equinor/fusion-framework-react-ag-grid/react` while resolving the monorepo-managed package instance.

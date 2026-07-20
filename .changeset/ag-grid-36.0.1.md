---
"@equinor/fusion-framework-module-ag-grid": major
"@equinor/fusion-framework-react-ag-grid": major
---

Bump `ag-grid-community`, `ag-grid-enterprise`, and `ag-grid-react` from `~35.3.1` to `~36.0.1`.

AG Grid 36 ships significant breaking changes — consumers **must** review the [AG Grid 36 migration guide](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-36/) before upgrading:

- **DOM structure overhaul**: Grid scrolling containers merged into a single container. CSS selectors targeting layout containers (pinned columns, sticky rows) will need updating.
- **Theme/RTL class placement**: Theme and RTL classes now set on a parent element — CSS like `.ag-root-wrapper.ag-rtl { ... }` must be updated to `.ag-rtl .ag-root-wrapper { ... }`.
- **`ValidationModule` removed** from `AllCommunityModule`/`AllEnterpriseModule` bundles. Call `enableDevValidations()` explicitly in dev to restore full diagnostics.
- **TypeScript minimum**: 5.8.3 required.
- **`createTheme()` no longer bundles** button and column-drop styles — re-add via `.withPart(buttonStyleQuartz)` / `.withPart(columnDropStyleBordered)` if needed.
- **Peer dependency range** updated from `>=35.1.0` to `>=36.0.0`.

New features: Calculated Columns, Show Values As, Automatic Column Generation.

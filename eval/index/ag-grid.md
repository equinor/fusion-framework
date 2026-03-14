# AG Grid

These queries cover `@equinor/fusion-framework-module-ag-grid`,
`@equinor/fusion-framework-react-ag-grid`, and
`@equinor/fusion-framework-react-ag-charts` — the AG Grid integration layer
that provides centralized license management, EDS-branded theming, tree-shakeable
module registration, and React bindings.

When judging results, verify that:
- Configuration helpers (`enableAgGrid`, `setLicenseKey`, `setTheme`, `setModules`,
  `addModule`) are attributed to the Fusion module package, not generic AG Grid.
- The EDS-branded `fusionTheme` and `createThemeFromTheme` cloning pattern are
  distinguished from plain AG Grid theming.
- Tree-shaking registration is shown as explicit (`builder.setModules([...])`)
  rather than a blanket `AllEnterpriseModules` import.
- AG Charts integration (`@equinor/fusion-framework-react-ag-charts`) is treated
  as a separate package from the AG Grid module, reflecting the v35 split.

## How to set up AG Grid in a Fusion app with license and theme configuration

- must mention `enableAgGrid` from `@equinor/fusion-framework-module-ag-grid` for module registration
- must show `setLicenseKey` on the configurator for AG Grid enterprise license
- must mention `fusionTheme` as the default EDS-branded theme with Equinor font and accent color
- must show `setTheme` with callback for customizing theme via `withParams`
- should mention `createThemeFromTheme` for cloning themes across module-federation boundaries
- should mention that themes inherit from parent (portal to application)

## How to register AG Grid feature modules for tree-shaking

- must mention `setModules` or `addModule` on the AG Grid configurator for explicit module registration
- must show that the default module list is empty to minimize bundle size
- must mention `ClientSideRowModelModule` as the required base row model
- should list enterprise modules like `ColumnsToolPanelModule`, `FiltersToolPanelModule`, `ExcelExportModule`, `MenuModule`
- should show the import path pattern using `/community` or `/enterprise` entry points from `@equinor/fusion-framework-react-ag-grid`

## How to use AG Grid React component with Fusion theming

- must mention `AgGridReact` from `@equinor/fusion-framework-react-ag-grid` as the grid component
- must mention `useTheme` hook for accessing the active theme from the AG Grid module
- must show per-instance theme override using `useTheme()` combined with `withParams`
- should mention `ColDef` type import from `@equinor/fusion-framework-react-ag-grid/community`
- should reference the `cookbooks/app-react-ag-grid` cookbook for end-to-end examples

## How to use AG Charts with AG Grid integrated charting in a Fusion app

- must mention `@equinor/fusion-framework-react-ag-charts` as the separate charts package
- must mention `IntegratedChartsModule.with(AgChartsEnterpriseModule)` pattern for enabling charts inside AG Grid
- must show that `AgChartsEnterpriseModule` comes from `@equinor/fusion-framework-react-ag-charts/enterprise`
- should mention `AgCharts` component for standalone chart usage
- should mention `enableCharts` grid prop and `createRangeChart` API for programmatic chart creation

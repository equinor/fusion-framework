---
"@equinor/fusion-framework-cookbook-app-react-ag-grid": patch
---

Update AG Grid Cookbook to use new standalone AG Charts package.

- Migrate `AgChartsEnterpriseModule` import from `@equinor/fusion-framework-react-ag-grid/enterprise` to `@equinor/fusion-framework-react-ag-charts/enterprise`
- Add `ValidationModule` to AG Grid configuration
- Add dependency on `@equinor/fusion-framework-react-ag-charts`

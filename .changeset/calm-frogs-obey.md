---
"@equinor/fusion-framework-cookbook-app-react-charts": patch
---

Update AG Charts Cookbook to use new standalone AG Charts package.

- Migrate all AG Charts imports from `@equinor/fusion-framework-react-ag-grid/charts` to `@equinor/fusion-framework-react-ag-charts`
- Add proper `ModuleRegistry` initialization with `AllCommunityModule`
- Update chart component imports to use new package exports
- Remove redundant axes configurations (now handled by default AG Charts configuration)
- Update `chart.js` and `react-chartjs-2` to latest versions
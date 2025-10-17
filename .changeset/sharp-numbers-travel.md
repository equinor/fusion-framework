---
"@equinor/fusion-framework-cookbook-app-react-charts": minor
---

Added AG Charts to React Charts cookbook

This update introduces AG Charts (ag-charts-community and ag-charts-react) as an alternative charting library alongside the existing Chart.js implementation. The cookbook now demonstrates both charting solutions with examples.

## New Features

- **AG Charts Integration**: Added ag-charts-community and ag-charts-react dependencies
- **Chart Components**: Four new AG Charts examples:
  - `AgBar` - Bar chart implementation
  - `AgPie` - Pie chart implementation  
  - `AgLine` - Line chart implementation
  - `AgArea` - Area chart implementation
- **Navigation Updates**: Enhanced navigation to include AG Charts examples
- **Styling**: Added styled-components for improved component styling

## Dependencies Added

- `ag-charts-community: ^12.2.0` - Core AG Charts library
- `ag-charts-react: ^12.2.0` - React bindings for AG Charts
- `styled-components: ^6.1.19` - CSS-in-JS styling solution

## Usage

The cookbook now provides side-by-side examples of both Chart.js and AG Charts implementations, allowing developers to compare and choose the best charting solution for their Fusion applications. All examples include sample data and demonstrate common chart types used in enterprise applications.

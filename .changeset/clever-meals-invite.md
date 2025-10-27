---
"@equinor/fusion-framework-react-ag-grid": patch
"@equinor/fusion-framework-cookbook-app-react-ag-grid": patch
---

Add React 19 support and AgChartsEnterpriseModule demonstration

## React 19 Compatibility

- **Updated peerDependencies**: AG Grid React package now supports React 17, 18, and 19
- **Version Range**: Extended React support from `^17.0.0 || ^18.0.0` to `^17.0.0 || ^18.0.0 || ^19.0.0`
- **Forward Compatibility**: Ensures compatibility with latest React features and improvements

## Enhanced AG Grid Cookbook

Enhanced the AG Grid cookbook with comprehensive charts functionality demonstration:

### New Features

- **Charts Enterprise Tab**: Added dedicated tab showcasing AgChartsEnterpriseModule integration
- **Interactive Demo**: Real-world sales data with chart creation instructions
- **Business Scenarios**: Multiple chart examples including:
  - Total Sales by Region (bar chart) 
  - Market Share by Region (pie chart)
  - Quarterly Sales Chart (multi-series column chart)

### Components Added

- **ChartsExample**: New component demonstrating enterprise charting capabilities
- **Regional Sales Data**: 7 unique regions with comprehensive sales metrics
- **Interactive Buttons**: One-click chart generation for different business scenarios

### Configuration Updates

- **AgChartsEnterpriseModule**: Added to module configuration alongside existing enterprise modules
- **Chart-Optimized Data**: Structured data for effective chart demonstrations
- **Enhanced Grid Props**: Simplified configuration focusing on charting capabilities

## Usage

The cookbook now provides a complete reference for integrating AG Charts Enterprise features:
- Interactive chart creation via context menu and buttons
- Multiple chart types (bar, column, pie) demonstration
- Data filtering and aggregation examples
- Enterprise chart features showcase

This serves as both a functional demo and implementation reference for developers using AG Grid with enterprise charting in React 19 applications.
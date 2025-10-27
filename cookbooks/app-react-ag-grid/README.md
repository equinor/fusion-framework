
# AG Grid Cookbook

This cookbook demonstrates the Fusion Framework's AG Grid integration, including both basic grid functionality and enterprise chart.

## Features Demonstrated

### Basic Grid (Tab 1)
- Standard AG Grid configuration with Fusion Framework
- Row selection and data manipulation
- Column definitions and custom formatting
- Side panel with filters and columns tools

### Charts Enterprise Demo (Tab 2)
- **AgChartsEnterpriseModule Integration**: Shows how to configure enterprise charting
- **Interactive Chart Buttons**: Pre-configured chart examples with one-click generation
- **Multiple Chart Types**: Bar charts, column charts, and pie charts
- **Regional Sales Data**: 7 unique regions with comprehensive business metrics
- **Chart Examples**:
  - **Total Sales by Region**: Bar chart comparing regional sales performance
  - **Market Share by Region**: Pie chart showing market share distribution
  - **Quarterly Sales Chart**: Multi-series column chart with Q1-Q4 breakdown

## Chart Examples

### Programmatic Chart Creation
The cookbook demonstrates how to create charts programmatically:

```typescript
const createSalesChart = useCallback(() => {
  gridRef.current?.api.createRangeChart({
    cellRange: {
      columns: ['region', 'totalSales'],
    },
    chartType: 'groupedBar',
    chartThemeOverrides: {
      common: {
        title: {
          enabled: true,
          text: 'Total Sales by Region',
        },
      },
    }
  });
}, []);
```

### Interactive Chart Creation
- Right-click on column headers and select "Chart Data"
- Choose from various chart types including enterprise-specific options
- Customize charts using the chart toolbar

## AgChartsEnterpriseModule Setup

The cookbook shows how to integrate the AgChartsEnterpriseModule:

```typescript
import { IntegratedChartsModule, AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';

enableAgGrid(configurator, (builder) => {
  builder.setModules([
    // ... other modules
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
  ]);
});
```

## Usage Instructions

### Charts Tab Features
1. **Pre-built Chart Examples**: Use the provided buttons for instant chart generation:
   - **Total Sales by Region**: Compares total sales across all regions
   - **Market Share by Region**: Displays market share distribution as a pie chart
   - **Quarterly Sales Chart**: Shows Q1-Q4 sales breakdown by region

2. **Manual Chart Creation**: 
   - Select one or more data columns (Q1-Q4 Sales, Total Sales, Profit, Market Share)
   - Right-click on selected columns
   - Choose "Chart Data" from context menu
   - Select chart type (enterprise types require valid license)
   - Customize using chart toolbar

### Data Structure
The cookbook uses realistic business data with:
- **7 Regions**: North America, Europe, Asia Pacific, South America, Middle East, Africa, Oceania
- **Sales Metrics**: Quarterly sales (Q1-Q4), total sales, profit, market share
- **Formatted Values**: Currency formatting for sales data, percentage for market share

## Requirements

- AG Grid Enterprise license for production use of charting features
- All community features work without license
- React 19 support

See fusion-framework documentation: [AG Grid guide](https://equinor.github.io/fusion-framework/guide/app/ag-grid.html)

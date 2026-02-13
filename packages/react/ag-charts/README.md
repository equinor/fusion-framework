# AG Charts React for Fusion Framework

## Installation

```sh
npm i @equinor/fusion-framework-react-ag-charts
```

## Module Install

```ts
import { AllCommunityModule, ModuleRegistry } from '@equinor/fusion-framework-react-ag-charts/community';

// Enable all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
```

## Usage

```tsx
import { AgCharts } from '@equinor/fusion-framework-react-ag-charts';
import { AgChartOptions } from '@equinor/fusion-framework-react-ag-charts/community';

const ChartExample = () => {
    // Chart Options: Control & configure the chart
    const [chartOptions, setChartOptions] = useState<AgChartOptions>({
        // Data: Data to be displayed in the chart
        data: [
            { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
            { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
            { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
            { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
            { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
            { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
        ],
        // Series: Defines which chart type and data to use
        series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],
    });

    return <AgCharts options={chartOptions} />;
};
```

## Enterprise Features

The `AgChartsEnterpriseModule` is available from the `/enterprise` namespace for advanced charting features.

```ts
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';
```

### Integration with AG Grid

When using AG Charts with AG Grid's integrated charting, you need to have `@equinor/fusion-framework-react-ag-grid` package installed and use `IntegratedChartsModule`:

```ts
// config.ts
import { IntegratedChartsModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';

// Use in AG Grid configuration
enableAgGrid(configurator, (builder) => {
    builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
});
```
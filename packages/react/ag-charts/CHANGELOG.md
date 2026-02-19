# @equinor/fusion-framework-react-ag-charts

## 13.0.0

### Major Changes

- [#4062](https://github.com/equinor/fusion-framework/pull/4062) [`7342a52`](https://github.com/equinor/fusion-framework/commit/7342a52cabf7c2e0281a1b5dc1ec6bfb683afe1e) Thanks [@AndrejNikolicEq](https://github.com/AndrejNikolicEq)! - ## New Package: AG Charts Standalone

  AG Charts functionality has been extracted into its own dedicated package `@equinor/fusion-framework-react-ag-charts`. This package provides standalone access to AG Charts community and enterprise features.

  ### Installation

  ```sh
  npm i @equinor/fusion-framework-react-ag-charts
  ```

  ### Usage

  ```tsx
  import { AgCharts } from "@equinor/fusion-framework-react-ag-charts";
  import { AgChartOptions } from "@equinor/fusion-framework-react-ag-charts/community";

  const ChartExample = () => {
    const [chartOptions] = useState<AgChartOptions>({
      data: [
        { month: "Jan", avgTemp: 2.3, iceCreamSales: 162000 },
        { month: "Mar", avgTemp: 6.3, iceCreamSales: 302000 },
      ],
      series: [{ type: "bar", xKey: "month", yKey: "iceCreamSales" }],
    });

    return <AgCharts options={chartOptions} />;
  };
  ```

  ### Integration with AG Grid

  For integrated charts within AG Grid, use the `IntegratedChartsModule` from `@equinor/fusion-framework-react-ag-grid`:

  ```ts
  import { IntegratedChartsModule } from "@equinor/fusion-framework-react-ag-grid/enterprise";
  import { AgChartsEnterpriseModule } from "@equinor/fusion-framework-react-ag-charts/enterprise";

  enableAgGrid(configurator, (builder) => {
    builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
  });
  ```

  ### Package Exports

  - **Main**: `AgCharts` React component
  - **Community**: `@equinor/fusion-framework-react-ag-charts/community` - community chart features
  - **Enterprise**: `@equinor/fusion-framework-react-ag-charts/enterprise` - advanced charting features

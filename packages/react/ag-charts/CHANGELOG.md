# @equinor/fusion-framework-react-ag-charts

## 14.0.0

### Major Changes

- abffa53: Major version bump for Fusion Framework React 19 release.

  All packages are bumped to the next major version as part of the React 19 upgrade. This release drops support for React versions below 18 and includes breaking changes across the framework.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React Router upgraded from v6 to v7
  - Navigation module refactored with new history API
  - `renderComponent` and `renderApp` now use `createRoot` API

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading
  - Replace `NavigationProvider.createRouter()` with `@equinor/fusion-framework-react-router`
  - See individual package changelogs for package-specific migration steps

- abffa53: Upgrade to React 19 and remove support for React versions lower than 18.

  **Breaking changes:**
  - Peer dependencies now require React 18 or 19 (`^18.0.0 || ^19.0.0`)
  - React 16 and 17 are no longer supported
  - Dev dependencies upgraded to React 19.2.1 and @types/react 19.2.7

  **Migration:**
  - Update your React version to 18.0.0 or higher before upgrading these packages
  - If using React 16 or 17, upgrade to React 18 or 19 first

  Closes https://github.com/equinor/fusion-framework/issues/3504

### Patch Changes

- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
- Updated dependencies [abffa53]
  - @equinor/fusion-framework-react-module@4.0.0

## 13.0.1

### Patch Changes

- [#4157](https://github.com/equinor/fusion-framework/pull/4157) [`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581) Thanks [@Noggling](https://github.com/Noggling)! - Internal: patch release to align TypeScript types across packages for consistent type compatibility.

- Updated dependencies [[`6aa8e1f`](https://github.com/equinor/fusion-framework/commit/6aa8e1f5c9d852b25e97aa7d98a63008c64d4581)]:
  - @equinor/fusion-framework-react-module@3.1.14

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

# @equinor/fusion-framework-react-ag-charts

Fusion Framework wrapper for [AG Charts](https://www.ag-grid.com/charts/) in React.
This package re-exports the AG Charts React component, community modules, and enterprise modules through Fusion-scoped entry points so that chart library versions stay aligned across all Fusion applications.

## Who Should Use This

Use `@equinor/fusion-framework-react-ag-charts` whenever you need to render charts
inside a Fusion Framework React application. The package ensures every app
consumes the same AG Charts version, avoiding duplicate bundles and version
mismatches.

## Installation

```sh
pnpm add @equinor/fusion-framework-react-ag-charts
```

## Entry Points

| Sub-path | What it provides | Upstream package |
| --- | --- | --- |
| `@equinor/fusion-framework-react-ag-charts` | `AgCharts` React component and React-level utilities | `ag-charts-react` |
| `@equinor/fusion-framework-react-ag-charts/community` | Community modules (`AllCommunityModule`), `ModuleRegistry`, and chart option types (`AgChartOptions`, `AgChartTheme`, …) | `ag-charts-community` |
| `@equinor/fusion-framework-react-ag-charts/enterprise` | Enterprise modules (`AgChartsEnterpriseModule`) and enterprise-only chart types | `ag-charts-enterprise` |

## Quick Start

### 1. Register Community Modules

Register chart modules **once** at application startup before rendering any chart:

```ts
import {
  AllCommunityModule,
  ModuleRegistry,
} from '@equinor/fusion-framework-react-ag-charts/community';

ModuleRegistry.registerModules([AllCommunityModule]);
```

### 2. Render a Chart

```tsx
import { useState } from 'react';
import { AgCharts } from '@equinor/fusion-framework-react-ag-charts';
import type { AgChartOptions } from '@equinor/fusion-framework-react-ag-charts/community';

const ChartExample = () => {
  const [chartOptions] = useState<AgChartOptions>({
    data: [
      { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
      { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
      { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
      { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
      { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
      { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
    ],
    series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],
  });

  return <AgCharts options={chartOptions} />;
};
```

## Enable Enterprise Chart Features

Import `AgChartsEnterpriseModule` from the `/enterprise` sub-path to unlock
advanced chart types such as waterfall, heatmap, sunburst, and treemap.

> Enterprise features require a valid AG Charts enterprise license.

```ts
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';
```

## Integrate AG Charts with AG Grid

When using AG Grid's built-in charting (integrated charts), pass the AG Charts
enterprise module to `IntegratedChartsModule.with()`. This requires the
`@equinor/fusion-framework-react-ag-grid` package:

```ts
import { IntegratedChartsModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';

enableAgGrid(configurator, (builder) => {
  builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
});
```

## Key Concepts

- **Module registration** — AG Charts uses a modular architecture. You must
  register the modules your application needs via `ModuleRegistry.registerModules()`
  before any chart renders. `AllCommunityModule` is the easiest starting point.
- **Chart options** — Charts are configured declaratively through an
  `AgChartOptions` object that describes data, series types, axes, legends, and
  themes.
- **Thin wrapper** — This package does not add custom logic. It re-exports
  upstream AG Charts packages so that Fusion applications share a single,
  centrally managed version.

## Related Packages

- [`@equinor/fusion-framework-react-ag-grid`](https://www.npmjs.com/package/@equinor/fusion-framework-react-ag-grid) — Fusion wrapper for AG Grid
- [AG Charts documentation](https://www.ag-grid.com/charts/) — Upstream API reference and examples
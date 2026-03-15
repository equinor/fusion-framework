# @equinor/fusion-framework-react-ag-grid

React integration for [AG Grid](https://www.ag-grid.com/) within **Fusion Framework** applications.

This package provides a pre-configured AG Grid setup with the Equinor Design System theme, license management, and module registration — so every grid in the application shares consistent styling and configuration out of the box.

## Who Should Use This

Any Fusion Framework React application that needs a data grid with sorting, filtering, grouping, inline editing, or Excel export. If you are building a standalone app outside Fusion Framework, use `ag-grid-react` directly instead.

## Quick Start

### Install

```sh
pnpm add @equinor/fusion-framework-react-ag-grid
```

### Enable the Module

Register the AG Grid module during application configuration:

```ts
import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';

export const configure = (configurator) => {
  enableAgGrid(configurator);
};
```

### Render a Grid

```tsx
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import { useTheme } from '@equinor/fusion-framework-react-ag-grid';
import type { ColDef } from '@equinor/fusion-framework-react-ag-grid/community';

const columns: ColDef[] = [
  { field: 'name' },
  { field: 'age', filter: 'agNumberColumnFilter' },
];

const MyGrid = ({ rows }) => {
  const theme = useTheme();
  return <AgGridReact theme={theme} rowData={rows} columnDefs={columns} />;
};
```

> [!IMPORTANT]
> Since AG Grid types are re-exported from this package, TypeScript may have
> trouble resolving them. Set `"moduleResolution": "bundler"` in your
> `tsconfig.json` to fix type-resolution issues.

## Key Concepts

| Concept | Description |
| --- | --- |
| **`enableAgGrid`** | Registers the AG Grid Fusion module. Accepts an optional builder callback for theme, license, and module customization. |
| **`useTheme`** | React hook that returns the active AG Grid `Theme` from the module system. |
| **`fusionTheme`** | Default theme applying Equinor fonts and EDS accent colors on top of AG Grid Alpine. |
| **`createTheme`** | Creates a new blank AG Grid theme for fully custom styling. |

## API Surface

### Main Entry Point (`@equinor/fusion-framework-react-ag-grid`)

| Export | Kind | Description |
| --- | --- | --- |
| `AgGridReact` | Component | React wrapper for rendering an AG Grid instance. |
| `AgGridReactProps` | Type | Props accepted by `AgGridReact`. |
| `enableAgGrid` | Function | Registers the AG Grid module on a Fusion configurator. |
| `IAgGridProvider` | Interface | Read-only provider exposing resolved license key and theme. |
| `fusionTheme` | Constant | Pre-built EDS-based AG Grid theme. |
| `createTheme` | Function | Creates a blank AG Grid theme. |
| `Theme` | Type | AG Grid theme type. |

### Community Entry Point (`@equinor/fusion-framework-react-ag-grid/community`)

Re-exports everything from `ag-grid-community` — column definitions, cell renderers, row models, events, and utilities.

### Enterprise Entry Point (`@equinor/fusion-framework-react-ag-grid/enterprise`)

Re-exports everything from `ag-grid-enterprise` — row grouping, tree data, server-side row model, Excel export, integrated charts, and more. Requires a valid license key.

### Themes Entry Point (`@equinor/fusion-framework-react-ag-grid/themes`)

| Export | Kind | Description |
| --- | --- | --- |
| `fusionTheme` | Constant | Default Fusion/EDS AG Grid theme. |
| `createTheme` | Function | Creates a blank theme. |
| `createThemeFromTheme` | Function | Clones a theme across module boundaries (necessary due to AG Grid `instanceof` checks). |
| `Theme` | Type | AG Grid theme type. |

## Common Patterns

### Customize the Global Theme

Override theme parameters during module configuration:

```ts
enableAgGrid(configurator, (builder) => {
  builder.setTheme((theme) => {
    return theme.withParams({
      backgroundColor: '#1f2836',
      browserColorScheme: 'dark',
      foregroundColor: '#FFF',
      headerFontSize: 14,
    });
  });
});
```

> [!TIP]
> AG Grid has a [theme builder](https://www.ag-grid.com/theme-builder/) for
> previewing and generating custom theme parameters.

### Override Theme per Grid Instance

Use `useTheme` to get the base theme, then customize it for a specific grid:

```tsx
import { useTheme } from '@equinor/fusion-framework-react-ag-grid';
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import { useMemo, useState } from 'react';

const MyComponent = () => {
  const baseTheme = useTheme();
  const [hasError, setHasError] = useState(false);

  const theme = useMemo(
    () => baseTheme.withParams({ cellTextColor: hasError ? '#FF0000' : undefined }),
    [baseTheme, hasError],
  );

  return <AgGridReact theme={theme} /* ...other props */ />;
};
```

### Use AG Grid Integrated Charts

Install the separate charts package and register `IntegratedChartsModule`:

```sh
pnpm add @equinor/fusion-framework-react-ag-charts
```

```ts
import { IntegratedChartsModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';

enableAgGrid(configurator, (builder) => {
  builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
});
```

> [!NOTE]
> AG Charts is a standalone package since v35. See
> [@equinor/fusion-framework-react-ag-charts](../ag-charts/README.md)
> for standalone chart usage.

## Upgrade Guides

### Upgrading to v35

**AG Charts separated**: Chart functionality moved to `@equinor/fusion-framework-react-ag-charts`.

```ts
// Before (v34)
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';

// After (v35)
import { IntegratedChartsModule } from '@equinor/fusion-framework-react-ag-grid/enterprise';
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';

enableAgGrid(configurator, (builder) => {
  builder.addModule(IntegratedChartsModule.with(AgChartsEnterpriseModule));
});
```

**Peer dependencies**: Update to `ag-grid-community` and `ag-grid-enterprise` >= 35.1.0.

### Upgrading from v32 to v33

Remove all previous references to `@equinor/fusion-react-ag-grid-styles`,
`@ag-grid-community/*`, and `@ag-grid-enterprise/*` from your project
dependencies. Only `@equinor/fusion-framework-react-ag-grid` should be installed.
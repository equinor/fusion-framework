# AG Grid Module for Fusion Framework

This module provides an agnostic wrapper around the [AG Grid](https://www.ag-grid.com/) library for use in Fusion applications. It sets up configuration and registers AG Grid modules, ensuring a consistent way to configure AG Grid and use it within Fusion portals and applications.

The intention of this module is to provide a consistent way to configure AG Grid and to ensure that the correct version of AG Grid is used.

## Installation

```sh
npm i @equinor/fusion-framework-module-ag-grid
npm i ag-grid-react // or the framework of your choice
```

> [!WARNING]
> Fusion will try to keep the semantic major and minor versions in sync with AG Grid, but there might be cases where this is not possible. So `@equinor/fusion-framework-module-ag-grid` and `ag-grid` might have different __patch__ versions.
>
> It is possible to install `ag-grid-enterprise` and `ag-grid-community` if needed, but it is recommended to use the modules provided by this package.

## Configuration

### Portal

```ts
import { type FrameworkConfigurator } from '@equinor/fusion-framework';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

export async function configure(config: FrameworkConfigurator) {
    enableAgGrid(config, (builder) => {
        builder.setLicenseKey('your-license-key');
    });
}
```

### Application

To use AG Grid in an application, the module needs to be enabled in the application configuration. 

> [!NOTE]
> All configuration is scoped to the application.

```ts
import { type AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';

export const configure: AppModuleInitiator = (configurator, { env }) => {
    enableAgGrid(configurator);
};
```

## Theming

This module uses the `alpine` theme as the base [theme for AG Grid](https://www.ag-grid.com/react-data-grid/theming/). 
The theme can be customized by providing a custom theme in the application.

> [!TIP]
> AG Grid has a [theme builder](https://www.ag-grid.com/theme-builder/) that can be used to preview and generate a custom theme.

```ts
enableAgGrid(configurator, (builder) => {
    builder.setTheme((theme) => {
        return theme.withParams({
            backgroundColor: "#1f2836",
            browserColorScheme: "dark",
            chromeBackgroundColor: {
                ref: "foregroundColor",
                mix: 0.07,
                onto: "backgroundColor"
            },
            foregroundColor: "#FFF",
            headerFontSize: 14
        });
    });
});
```

> [!IMPORTANT]
> Themes are by default inherited from parent scopes (aka portals).
> This means that the theme set in the portal will be inherited by the application.
>
> __NOTE:__ Configured themes are global and will affect all instances of AG Grid in the application.

### Customizing a grid instance

The module provides a hook to customize a grid instance.

```tsx
import { useTheme } from '@equinor/fusion-framework-react-app/ag-grid';

const MyComponent = () => {
    const baseTheme = useTheme();
    const [hasError, setHasError] = useState(false);
    const theme = useMemo(() => baseTheme.withParams({
        // add red text color if error
        cellTextColor: hasError ? "#FF0000" : baseTheme.cellTextColor,
    }), [baseTheme, hasError]);

    return (
        <AgGridReact
            theme={theme}
            ...
        />
    );
};
```

## Modules

Since AG Grid 33, all modules have been aggregated into a single package, which means the modules need to be defined in the application configuration.

```ts
import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
import { ClientSideRowModelModule } from '@equinor/fusion-framework-module-ag-grid/community';
import {
    ClipboardModule,
    ColumnsToolPanelModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    MenuModule,
} from '@equinor/fusion-framework-module-ag-grid/enterprise';

export const configure: AppModuleInitiator = (configurator, { env }) => {
    enableAgGrid(configurator, (builder) => {
        builder.addModules([
            ClientSideRowModelModule,
            ClipboardModule,
            ColumnsToolPanelModule,
            ExcelExportModule,
            FiltersToolPanelModule,
            MenuModule,
        ]);
    });
};
```

> [!IMPORTANT]
> Modules are required to be defined in the application configuration, as this is the only way to ensure that tree shaking works correctly.

## Usage

### Enterprise and Community features

Enterprise features are available from the namespace `@equinor/fusion-framework-module-ag-grid/enterprise`.

Community features are available from the namespace `@equinor/fusion-framework-module-ag-grid/community`.

> [!NOTE]
> Since this is only a re-export of the `ag-grid` packages, there might be some issues with TypeScript typings.
> 
> Please leave an issue if you encounter any problems.

### Example

```ts
import { AgGridReact } from "ag-grid-react";
import type {
  CellValueChangedEvent,
  ColDef,
  ValueParserParams,
} from "@equinor/fusion-framework-module-ag-grid/community";

function numberParser(params: ValueParserParams) {
  return Number(params.newValue);
}

const GridExample = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [rowData, setRowData] = useState<any[]>(getData());
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { headerName: "Name", field: "simple" },
    { headerName: "Bad Number", field: "numberBad" },
    {
      headerName: "Good Number",
      field: "numberGood",
      valueParser: numberParser,
    },
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      editable: true,
      cellDataType: false,
    };
  }, []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    console.log("data after changes is: ", event.data);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </div>
  );
};
```

## Migration from AG Grid 32 to 33

Since AG Grid version 33, there have been significant breaking changes regarding the module structure and tree shaking. All modules have been consolidated into a single package, which necessitates defining the modules in the application configuration to ensure proper tree shaking. This change aims to streamline the module management process and improve performance by only including the necessary modules in the final bundle.

>[!IMPORTANT]

>It is crucial for developers to read this guide thoroughly to understand the changes and migration steps required for upgrading to AG Grid 33.
> Additionally, developers should also refer to the official AG Grid upgrade guide available at [Upgrading to AG Grid 33](https://www.ag-grid.com/react-data-grid/upgrading-to-ag-grid-33/) for comprehensive details and best practices.

### Imports
__Remove the following imports:__

- `@ag-grid-community/*`
- `@ag-grid-enterprise/*`

__Replace with:__

- `@equinor/fusion-framework-module-ag-grid`

### Modules

Since AG Grid 33, all modules have been aggregated into a single package, which means the modules need to be defined in the application configuration.

Move all `ModuleRegistry.registerModules` to `builder.setModules` in the application configuration.

```diff
// my-app/src/app.ts
- import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
- import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
- import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
- import { MenuModule } from '@ag-grid-enterprise/menu';
- import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
- import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
- import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

- ModuleRegistry.registerModules([
-     ClientSideRowModelModule,
-     ColumnsToolPanelModule,
-     FiltersToolPanelModule,
-     MenuModule,
-     ExcelExportModule,
-     RangeSelectionModule,
-     ClipboardModule,
- ]);
// config.ts
+ import { enableAgGrid } from '@equinor/fusion-framework-module-ag-grid';
+ import { ClientSideRowModelModule } from '@equinor/fusion-framework-module-ag-grid/community';
+ import {
+     ClipboardModule,
+     ColumnsToolPanelModule,
+     ExcelExportModule,
+     FiltersToolPanelModule,
+     MenuModule,
+ } from '@equinor/fusion-framework-module-ag-grid/enterprise';
  
  export const configure: AppModuleInitiator = (configurator, { env }) => {
+    enableAgGrid(configurator, (builder) => {
+        builder.addModules([
+            ClientSideRowModelModule,
+            ClipboardModule,
+            ColumnsToolPanelModule,
+            ExcelExportModule,
+            FiltersToolPanelModule,
+            MenuModule,
+        ]);
+    });
  };
```
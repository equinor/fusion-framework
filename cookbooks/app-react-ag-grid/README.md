# AG Grid Cookbook

This cookbook demonstrates how to integrate AG Grid data tables and enterprise charting into your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Enable the AG Grid module with required modules
- Create a data grid with columns and rows
- Add dynamic row manipulation
- Configure column definitions and sidebar panels
- Set up enterprise charting with AgChartsEnterpriseModule
- Create charts programmatically from grid data

## Code Example

### Enable AG Grid Module

In `src/config.ts`, enable AG Grid with required modules:

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ValidationModule,
} from '@equinor/fusion-framework-react-ag-grid/community';
import {
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MenuModule,
  IntegratedChartsModule,
} from '@equinor/fusion-framework-react-ag-grid/enterprise';
import { AgChartsEnterpriseModule } from '@equinor/fusion-framework-react-ag-charts/enterprise';

export const configure: AppModuleInitiator = (configurator, { env }) => {
  enableAgGrid(configurator, (builder) => {
    builder.setModules([
      ClientSideRowModelModule,    // Client-side row model
      ColumnsToolPanelModule,      // Columns panel in sidebar
      FiltersToolPanelModule,      // Filters panel in sidebar
      MenuModule,                  // Context menu
      ExcelExportModule,           // Excel export functionality
      ClipboardModule,             // Copy/paste functionality
      IntegratedChartsModule.with(AgChartsEnterpriseModule), // Enterprise charts
      AllCommunityModule,          // All community features
      ValidationModule,            // Data validation
    ]);
  });
};
```

### Define Column Configuration

In `src/table/coldef.tsx`:

```typescript
export const defaultColDef = {
  resizable: true,  // Columns can be resized
  filter: true,     // Columns can be filtered
  flex: 1,         // Columns flex to fill space
  minWidth: 100,   // Minimum column width
  sortable: true,  // Columns can be sorted
};
```

### Define Sidebar Configuration

In `src/table/sidebar.tsx`:

```typescript
export const sideBar = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressRowGroups: true,
        suppressValues: true,
        suppressPivots: true,
        suppressPivotMode: true,
        suppressColumnFilter: true,
        suppressColumnSelectAll: true,
        suppressColumnExpandAll: true,
      },
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
      toolPanelParams: {
        suppressExpandAll: true,
        suppressFilterSearch: true,
      },
    },
  ],
  defaultToolPanel: '',
};
```

### Use the Grid Component

In `src/App.tsx`:

```typescript
import { useCallback, useMemo, useState } from 'react';
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import { type ColDef } from '@equinor/fusion-framework-react-ag-grid/community';

type RowDataType = {
  make: string;
  model: string;
  price: number;
};

export const App = () => {
  const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);
  const [rowData, setRowData] = useState<RowDataType[]>([]);

  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      { field: 'make' },
      { field: 'model' },
      { field: 'price' },
    ];
  }, []);

  const onGridReady = useCallback(() => {
    setRowData([
      { make: 'Toyota', model: 'Celica', price: 35000 },
      { make: 'Ford', model: 'Mondeo', price: 32000 },
      { make: 'Porsche', model: 'Boxster', price: 72000 },
    ]);
  }, []);

  const addRow = useCallback(() => {
    setRowData([
      ...rowData,
      {
        make: 'Lada',
        model: `Turbo x ${rowData.length}`,
        price: 53200 + rowData.length,
      },
    ]);
  }, [rowData]);

  return (
    <>
      <button type="button" onClick={addRow}>Add Row</button>
      <div style={gridStyle}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          sideBar={sideBar}
          rowSelection={{ mode: 'multiRow', checkboxes: true }}
          copyHeadersToClipboard={true}
          allowContextMenuWithControlKey={true}
          onGridReady={onGridReady}
        />
      </div>
    </>
  );
};
```

### Create Charts Programmatically

For enterprise charting, use the grid API to create charts:

```typescript
import { useRef, useCallback } from 'react';
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';

export const ChartsExample = () => {
  const gridRef = useRef<AgGridReact>(null);

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
      },
    });
  }, []);

  return (
    <>
      <button onClick={createSalesChart}>Create Sales Chart</button>
      <AgGridReact ref={gridRef} enableCharts={true} {...props} />
    </>
  );
};
```

## Key Concepts

### Module Setup

AG Grid requires specific modules to be configured:
- **ClientSideRowModelModule**: Handles rows in browser memory
- **ColumnsToolPanelModule**: Provides column management UI
- **FiltersToolPanelModule**: Provides filter management UI
- **MenuModule**: Context menu functionality
- **ExcelExportModule**: Export to Excel
- **ClipboardModule**: Copy/paste support
- **IntegratedChartsModule.with(AgChartsEnterpriseModule)**: Enterprise charting (requires `@equinor/fusion-framework-react-ag-charts` package)
- **AllCommunityModule**: All community features
- **ValidationModule**: Data validation

### Column Configuration

The `columnDefs` array defines each column:
- `field`: Property name in row data
- `headerName`: Display name for the column header
- `valueFormatter`: Function to format cell values
- `type`: Column type (e.g., 'numericColumn')

### Interactive Chart Creation

Users can create charts interactively:
- Select one or more columns in the grid
- Right-click on selected columns
- Choose "Chart Range" from context menu
- Select chart type (enterprise types require valid license)
- Customize using chart toolbar

### Grid Interaction

- Click checkbox to select rows
- Resize columns by dragging borders
- Use sidebar to show/hide columns and filters
- Ctrl+click to open context menu
- Data persists in component state

## When to Use AG Grid

Use AG Grid for:
- Large datasets that need performance
- Complex filtering and sorting
- Exporting data to Excel
- Column management and customization
- Enterprise-level data tables
- Interactive data visualization with charts

## Requirements

- AG Grid v35+ (provided by `@equinor/fusion-framework-react-ag-grid`)
- AG Charts v13+ for charting features (provided by `@equinor/fusion-framework-react-ag-charts`)
- AG Grid Enterprise license for production use of enterprise features
- All community features work without license
- React 18+

See fusion-framework documentation: [AG Grid guide](https://equinor.github.io/fusion-framework/guide/app/ag-grid.html)

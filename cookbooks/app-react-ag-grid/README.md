# AG Grid Cookbook

This cookbook demonstrates how to integrate AG Grid data tables into your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Enable the AG Grid module with required modules
- Create a data grid with columns and rows
- Add dynamic row manipulation
- Configure column definitions and defaults
- Set up sidebar for column management

## Key Concepts

AG Grid is an enterprise data grid component. The cookbook shows:
- Module configuration in `config.ts`
- Component setup in `App.tsx`
- Column and sidebar configuration files

## Code Example

### 1. Enable AG Grid Module

In `src/config.ts`, enable AG Grid with required modules:

```typescript
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';
import { enableAgGrid } from '@equinor/fusion-framework-react-ag-grid';
import { ClientSideRowModelModule } from '@equinor/fusion-framework-react-ag-grid/community';
import {
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  MenuModule,
} from '@equinor/fusion-framework-react-ag-grid/enterprise';

export const configure: AppModuleInitiator = (configurator, { env }) => {
  // Enable AG Grid with required modules
  enableAgGrid(configurator, (builder) => {
    builder.setModules([
      ClientSideRowModelModule,    // Client-side row model
      ColumnsToolPanelModule,      // Columns panel in sidebar
      FiltersToolPanelModule,      // Filters panel in sidebar
      MenuModule,                  // Context menu
      ExcelExportModule,           // Excel export functionality
      ClipboardModule,             // Copy/paste functionality
    ]);
  });
};
```

### 2. Define Column Configuration

In `src/table/coldef.tsx`:

```typescript
// Example of column definition
export const defaultColDef = {
  resizable: true,  // Columns can be resized
  filter: true,     // Columns can be filtered
  flex: 1,         // Columns flex to fill space
  minWidth: 100,   // Minimum column width
  sortable: true,  // Columns can be sorted
};
```

### 3. Define Sidebar Configuration

In `src/table/sidebar.tsx`:

```typescript
// Example of side bar definition
export const sideBar = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
      toolPanelParams: {
        suppressRowGroups: true,      // Hide row groups
        suppressValues: true,         // Hide values
        suppressPivots: true,         // Hide pivots
        suppressPivotMode: true,      // Hide pivot mode
        suppressColumnFilter: true,   // Hide column filter
        suppressColumnSelectAll: true, // Hide select all
        suppressColumnExpandAll: true, // Hide expand all
      },
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
      toolPanelParams: {
        suppressExpandAll: true,     // Hide expand all
        suppressFilterSearch: true,  // Hide filter search
      },
    },
  ],
  defaultToolPanel: '',  // No panel open by default
};
```

### 4. Use the Grid Component

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

  // Define column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    return [
      {
        field: 'make',
        headerCheckboxSelection: true,  // Show checkbox in header
        checkboxSelection: true,        // Show checkbox in cells
        showDisabledCheckboxes: true,
      },
      { field: 'model' },
      { field: 'price' },
    ];
  }, []);

  // Set initial data when grid is ready
  const onGridReady = useCallback(() => {
    setRowData([
      { make: 'Toyota', model: 'Celica', price: 35000 },
      { make: 'Ford', model: 'Mondeo', price: 32000 },
      { make: 'Porsche', model: 'Boxster', price: 72000 },
    ]);
  }, []);

  // Add a new row
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
      <div>
        <h4>Hello Fusion-framework Ag-Grid</h4>
        <button type="button" onClick={addRow}>Add Row</button>
      </div>
      <div style={gridStyle}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}  // From coldef.tsx
          sideBar={sideBar}              // From sidebar.tsx
          rowSelection={'multiple'}      // Enable multiple selection
          copyHeadersToClipboard={true}  // Copy with headers
          allowContextMenuWithControlKey={true} // Ctrl+click for menu
          onGridReady={onGridReady}      // Initialize data
        />
      </div>
    </>
  );
};
```

## Understanding the Pattern

### Module Setup

AG Grid requires specific modules to be configured:
- **ClientSideRowModelModule**: Handles rows in browser memory
- **ColumnsToolPanelModule**: Provides column management UI
- **FiltersToolPanelModule**: Provides filter management UI
- **MenuModule**: Context menu functionality
- **ExcelExportModule**: Export to Excel
- **ClipboardModule**: Copy/paste support

### Column Configuration

The `columnDefs` array defines each column:
- `field`: Property name in row data
- `headerCheckboxSelection`: Checkbox in column header
- `checkboxSelection`: Checkbox in each row

### Grid Interaction

- Click checkbox to select rows
- Resize columns by dragging borders
- Use sidebar to show/hide columns and filters
- Ctrl+click to open context menu
- Data persists in component state

### Adding Rows

Rows can be added dynamically by updating the state:

```typescript
const addRow = useCallback(() => {
  setRowData([...rowData, newRow]);
}, [rowData]);
```

## When to Use AG Grid

AG Grid is perfect for:
- Large datasets that need performance
- Complex filtering and sorting
- Exporting data to Excel
- Column management and customization
- Enterprise-level data tables

This cookbook shows the basics - AG Grid has many more features for advanced use cases.
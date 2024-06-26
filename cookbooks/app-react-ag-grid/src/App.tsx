// Import necessary hooks and components from React and Ag-Grid
import { useCallback, useMemo, useState } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import useStyles from '@equinor/fusion-react-ag-grid-styles';
import { ColDef, ModuleRegistry } from '@ag-grid-community/core';

// Import required Ag-Grid modules
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

// Import custom table configuration
import { defaultColDef, sideBar } from './table';

// Register Ag-Grid modules
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    ExcelExportModule,
    RangeSelectionModule,
    ClipboardModule,
]);

// Define the type for the row data
export type RowDataType = {
    make: string;
    model: string;
    price: number;
};

export const App = (): JSX.Element => {
    // Use custom styles for the grid
    useStyles();
    // Define the grid style
    const gridStyle = useMemo(() => ({ height: '600px', width: '100%' }), []);

    // Initialize state for the row data
    const [rowData, setRowData] = useState<RowDataType[]>([]);

    // Define column definitions with useMemo
    const columnDefs = useMemo<ColDef[]>(() => {
        return [
            {
                field: 'make',
                headerCheckboxSelection: true,
                checkboxSelection: true,
                showDisabledCheckboxes: true,
            },
            { field: 'model' },
            { field: 'price' },
        ];
    }, []);

    // Define a function to add a new row
    const addRow = useCallback(() => {
        setRowData([
            ...rowData,
            {
                make: 'Lada',
                model: `Turbo x ${rowData.length}`,
                price: 53200 + rowData.length,
            },
        ]);
    }, [rowData, setRowData]);

    // Define a function to set initial grid data when the grid is ready
    const onGridReady = useCallback(() => {
        setRowData([
            { make: 'Toyota', model: 'Celica', price: 35000 },
            { make: 'Ford', model: 'Mondeo', price: 32000 },
            { make: 'Porsche', model: 'Boxster', price: 72000 },
        ]);
    }, []);

    return (
        <>
            <div>
                <h4>Hello Fusion-framework Ag-Grid</h4>
                <button onClick={addRow}>Add Row</button>
            </div>
            <div style={gridStyle} className="ag-theme-alpine-fusion">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    sideBar={sideBar}
                    rowSelection={'multiple'}
                    suppressRowClickSelection={true}
                    enableRangeSelection={true}
                    copyHeadersToClipboard={true}
                    allowContextMenuWithControlKey={true}
                    onGridReady={onGridReady}
                />
            </div>
        </>
    );
};

export default App;

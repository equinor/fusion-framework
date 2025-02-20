// Import necessary hooks and components from React and Ag-Grid
import { useCallback, useMemo, useState } from 'react';
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import { createTheme, type ColDef } from '@equinor/fusion-framework-react-ag-grid/community';

// Import custom table configuration
import { defaultColDef, sideBar } from './table';

// Define the type for the row data
export type RowDataType = {
    make: string;
    model: string;
    price: number;
};

export const App = (): JSX.Element => {
    // Use custom styles for the grid
    // Define the grid style
    const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);

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

    const _customTheme = useMemo(
        () =>
            createTheme().withParams({
                textColor: '#39a',
            }),
        [],
    );

    return (
        <>
            <div>
                <h4>Hello Fusion-framework Ag-Grid</h4>
                <button onClick={addRow}>Add Row</button>
            </div>
            <div style={gridStyle}>
                <AgGridReact
                    rowData={rowData}
                    // theme={_customTheme}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    sideBar={sideBar}
                    rowSelection={'multiple'}
                    copyHeadersToClipboard={true}
                    allowContextMenuWithControlKey={true}
                    onGridReady={onGridReady}
                />
            </div>
        </>
    );
};

export default App;

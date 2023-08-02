import { AgGridReact } from '@ag-grid-community/react';
import useStyles from '@equinor/fusion-react-ag-grid-styles';
import { useCallback, useMemo, useState } from 'react';

import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export const App = (): JSX.Element => {
    const styles = useStyles();

    const [rowData, setRowData] = useState([
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
    ]);

    const columnDefs = useMemo(
        () => [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
        [],
    );

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

    return (
        <>
            <div>
                <h4>Hello Fusion-framework Ag-Grid</h4>
                <button onClick={addRow}>Add Row</button>
            </div>
            <div className={styles.root}>
                <div className="ag-theme-alpine-fusion" style={{ height: 400, width: 600 }}>
                    <AgGridReact rowData={rowData} columnDefs={columnDefs}></AgGridReact>
                </div>
            </div>
        </>
    );
};

export default App;

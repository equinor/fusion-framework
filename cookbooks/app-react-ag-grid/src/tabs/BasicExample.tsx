import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import { defaultColDef, sideBar } from '../table';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import type { ColDef } from '@equinor/fusion-framework-react-ag-grid/community';
import { Button } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Styled = {
  AddButton: styled(Button)`
    margin-bottom: .2rem;
  `,
};

// Define the type for the row data
export type RowDataType = {
  make: string;
  model: string;
  price: number;
};

export const BasicExample = (): ReactElement => {
  // Define the grid style
  const gridStyle = useMemo(() => ({ height: '400px', width: '100%' }), []);

  // Initialize state for the row data
  const [rowData, setRowData] = useState<RowDataType[]>([]);

  // Define column definitions with useMemo
  const columnDefs = useMemo<ColDef[]>(() => {
    return [{ field: 'make' }, { field: 'model' }, { field: 'price' }];
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
  }, [rowData]);

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
      <div style={{ marginBottom: '10px' }}>
        <Styled.AddButton variant="contained" onClick={addRow}>
          + Add Row
        </Styled.AddButton>
      </div>
      <div style={gridStyle}>
        <AgGridReact
          rowData={rowData}
          // theme={_customTheme}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          sideBar={sideBar}
          rowSelection={{
            mode: 'multiRow',
            checkboxes: true,
            headerCheckbox: true,
            hideDisabledCheckboxes: true,
          }}
          copyHeadersToClipboard={true}
          allowContextMenuWithControlKey={true}
          onGridReady={onGridReady}
        />
      </div>
    </>
  );
};

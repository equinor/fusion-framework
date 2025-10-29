import { type ReactElement, useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import type { ColDef } from '@equinor/fusion-framework-react-ag-grid/community';
import { Button, Divider, List, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';
import { chartsData, defaultColDef, type SalesData } from '../table';

const Styled = {
  AgContainer: styled.div`
    height: 28rem;
    width: 100%;
  `,
  Wrapper: styled.div`
    margin-top: 1rem;
  `,
  Section: styled.div`
    margin-bottom: 2rem;
  `,
  Buttons: styled.div`
    display: flex;
    align-items: center;
    gap: .2rem;
    margin-bottom: .5rem;
  `,
  List: styled(List)`
    margin: 1rem 0;
  `,
};

export const ChartsExample = (): ReactElement => {
  const gridRef = useRef<AgGridReact>(null);

  const rowData = useMemo<SalesData[]>(() => chartsData, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'region',
        headerName: 'Region',
        width: 130,
        flex: 0,
      },
      {
        field: 'salesQ1',
        headerName: 'Q1 Sales',
        type: 'numericColumn',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      },
      {
        field: 'salesQ2',
        headerName: 'Q2 Sales',
        type: 'numericColumn',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      },
      {
        field: 'salesQ3',
        headerName: 'Q3 Sales',
        type: 'numericColumn',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      },
      {
        field: 'salesQ4',
        headerName: 'Q4 Sales',
        type: 'numericColumn',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      },
      {
        field: 'totalSales',
        headerName: 'Total Sales',
        type: 'numericColumn',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      },
      {
        field: 'profit',
        headerName: 'Profit',
        type: 'numericColumn',
        valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
      },
      {
        field: 'marketShare',
        headerName: 'Market Share (%)',
        type: 'numericColumn',
        valueFormatter: (params) => `${params.value}%`,
      },
    ],
    [],
  );

  const quarterlySalesChart = useCallback(() => {
    gridRef.current?.api.createRangeChart({
      cellRange: {
        columns: ['region', 'salesQ1', 'salesQ2', 'salesQ3', 'salesQ4'],
      },
      chartType: 'groupedColumn',
      chartThemeOverrides: {
        common: {
          title: {
            enabled: true,
            text: 'Quarterly Sales by Region',
          },
          legend: {
            enabled: true,
          },
        },
      },
    });
  }, []);

  const totalSalesByRegion = useCallback(() => {
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
          legend: {
            enabled: false,
          },
        },
      },
    });
  }, []);

  const marketShareByRegion = useCallback(() => {
    gridRef.current?.api.createRangeChart({
      cellRange: {
        columns: ['region', 'marketShare'],
      },
      chartType: 'pie',
      chartThemeOverrides: {
        common: {
          title: {
            enabled: true,
            text: 'Market Share Distribution by Region',
          },
          legend: {
            enabled: true,
            position: 'right',
          },
        },
      },
    });
  }, []);

  return (
    <div>
      <Styled.Section>
        <Typography group="heading" variant="h4">
          AG Charts Enterprise Demo
        </Typography>
        <Divider variant="small" />
        <Typography group="paragraph" variant="body_long">
          This grid demonstrates the AgChartsEnterpriseModule integration.
        </Typography>
        <Styled.List>
          <List.Item>
            <strong>Create Charts:</strong> Right-click on selected cells and select "Chart Range"
          </List.Item>
          <List.Item>
            <strong>Enterprise Features:</strong> Access advanced chart types (waterfall, box plot,
            etc.)
          </List.Item>
          <List.Item>
            <strong>Regional Data:</strong> Each row represents a unique region with sales data
          </List.Item>
          <List.Item>
            <strong>Multiple Examples:</strong> Click on already created chart examples to see
            different column selection at work
          </List.Item>
        </Styled.List>
      </Styled.Section>
      <Styled.Buttons>
        <Button onClick={totalSalesByRegion}>Total Sales by Region</Button>
        <Button onClick={marketShareByRegion}>Market Share by Region</Button>
        <Button onClick={quarterlySalesChart}>Quarterly Sales Chart</Button>
      </Styled.Buttons>
      <Styled.AgContainer>
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          enableCharts={true}
          cellSelection={true}
        />
      </Styled.AgContainer>

      <Styled.Wrapper>
        <Typography group="heading" variant="h4">
          Chart Creation Instructions
        </Typography>
        <Divider variant="small" />
        <Styled.List variant="numbered">
          <List.Item>
            Select one or more data cells (Q1-Q4 Sales, Total Sales, Profit, Market Share...)
          </List.Item>
          <List.Item>Right-click on the selected cells</List.Item>
          <List.Item>Choose "Chart Range" from the context menu</List.Item>
          <List.Item>
            Select from various chart types including enterprise-specific options
          </List.Item>
          <List.Item>Customize your chart using the chart toolbar</List.Item>
        </Styled.List>
      </Styled.Wrapper>
    </div>
  );
};

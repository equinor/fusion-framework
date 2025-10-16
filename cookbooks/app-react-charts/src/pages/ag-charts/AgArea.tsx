import type { AgChartOptions } from 'ag-charts-community';
import { salesData } from './Data';
import { useMemo } from 'react';
import Styled from '../../App.style';
import { AgCharts } from 'ag-charts-react';

export const AgArea = (): JSX.Element => {
  // Area Chart Configuration
  const areaChartOptions = useMemo<AgChartOptions>(
    () => ({
      data: salesData,
      title: {
        text: 'Revenue Composition',
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtitle: {
        text: 'Stacked Area Chart of Financial Components',
      },
      series: [
        {
          type: 'area',
          xKey: 'quarter',
          yKey: 'expenses',
          yName: 'Expenses',
          fill: '#ff7f0e',
          stroke: '#ff7f0e',
          fillOpacity: 0.7,
          strokeWidth: 2,
        },
        {
          type: 'area',
          xKey: 'quarter',
          yKey: 'profit',
          yName: 'Profit',
          fill: '#2ca02c',
          stroke: '#2ca02c',
          fillOpacity: 0.7,
          strokeWidth: 2,
        },
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          title: {
            text: 'Quarter',
          },
        },
        {
          type: 'number',
          position: 'left',
          title: {
            text: 'Amount ($)',
          },
          label: {
            formatter: ({ value }: { value: number }) => `$${(value / 1000).toFixed(0)}k`,
          },
        },
      ],
      legend: {
        position: 'bottom',
      },
    }),
    [],
  );

  return (
    <Styled.Main>
      <Styled.Title group="heading" variant="h2">
        AG Charts Area Example
      </Styled.Title>
      <Styled.Title group="heading" variant="h5">
        Stacked visualization of financial components
      </Styled.Title>

      <Styled.AgChartContainer>
        <AgCharts style={{ height: '100%', width: '100%' }} options={areaChartOptions} />
      </Styled.AgChartContainer>
    </Styled.Main>
  );
};

export default AgArea;

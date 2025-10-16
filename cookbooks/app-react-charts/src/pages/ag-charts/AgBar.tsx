import type { AgChartOptions } from 'ag-charts-community';
import { salesData } from './Data';
import { useMemo } from 'react';
import Styled from '../../App.style';
import { AgCharts } from 'ag-charts-react';

export const AgBar = (): JSX.Element => {
  // Bar Chart Configuration
  const barChartOptions = useMemo<AgChartOptions>(
    () => ({
      data: salesData,
      title: {
        text: 'Quarterly Revenue vs Profit',
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtitle: {
        text: 'Financial Performance Over Time',
      },
      series: [
        {
          type: 'bar',
          xKey: 'quarter',
          yKey: 'revenue',
          yName: 'Revenue',
          fill: '#1f77b4',
          stroke: '#1f77b4',
          strokeWidth: 2,
        },
        {
          type: 'bar',
          xKey: 'quarter',
          yKey: 'profit',
          yName: 'Profit',
          fill: '#ff7f0e',
          stroke: '#ff7f0e',
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
        AG Charts Bar Example
      </Styled.Title>
      <Styled.Title group="heading" variant="h5">
        Compare revenue vs profit across quarters with interactive tooltips
      </Styled.Title>

      <Styled.AgChartContainer>
        <AgCharts style={{ height: '100%', width: '100%' }} options={barChartOptions} />
      </Styled.AgChartContainer>
    </Styled.Main>
  );
};

export default AgBar;

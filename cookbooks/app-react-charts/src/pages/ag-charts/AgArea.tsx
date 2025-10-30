import type { AgChartOptions } from 'ag-charts-community';
import { salesData } from './Data';
import { type ReactElement, useMemo } from 'react';
import Styled from '../../App.style';
import { AgCharts } from 'ag-charts-react';

/**
 * AgArea Component - Stacked Area Chart Visualization
 *
 * Displays a stacked area chart showing revenue composition over time, with separate
 * areas for expenses and profit. This component demonstrates how to create a stacked
 * area chart with custom fills, strokes, and formatted axes using AG Charts.
 *
 * @returns {ReactElement} A rendered stacked area chart showing revenue composition
 */
export const AgArea = (): ReactElement => {
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

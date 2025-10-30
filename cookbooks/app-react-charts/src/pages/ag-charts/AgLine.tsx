import type { AgChartOptions } from 'ag-charts-community';
import { temperatureData } from './Data';
import { type ReactElement, useMemo } from 'react';
import Styled from '../../App.style';
import { AgCharts } from 'ag-charts-react';

/**
 * AgLine Component - Line Chart Visualization
 *
 * Displays a multi-series line chart showing temperature trends including average,
 * minimum, and maximum values across months. This component demonstrates how to create
 * a professional line chart with multiple series, custom markers, and styled axes.
 *
 * @returns {ReactElement} A rendered line chart showing temperature trends
 */
export const AgLine = (): ReactElement => {
  // Line Chart Configuration
  const lineChartOptions = useMemo<AgChartOptions>(
    () => ({
      data: temperatureData,
      title: {
        text: 'Temperature Trends',
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtitle: {
        text: 'Monthly Temperature Variations',
      },
      series: [
        {
          type: 'line',
          xKey: 'month',
          yKey: 'avg',
          yName: 'Average',
          stroke: '#1f77b4',
          strokeWidth: 3,
          marker: {
            enabled: true,
            shape: 'circle',
            size: 8,
          },
        },
        {
          type: 'line',
          xKey: 'month',
          yKey: 'min',
          yName: 'Minimum',
          stroke: '#2ca02c',
          strokeWidth: 2,
          marker: {
            enabled: true,
            shape: 'triangle',
            size: 6,
          },
        },
        {
          type: 'line',
          xKey: 'month',
          yKey: 'max',
          yName: 'Maximum',
          stroke: '#d62728',
          strokeWidth: 2,
          marker: {
            enabled: true,
            shape: 'square',
            size: 6,
          },
        },
      ],
      axes: [
        {
          type: 'category',
          position: 'bottom',
          title: {
            text: 'Month',
          },
        },
        {
          type: 'number',
          position: 'left',
          title: {
            text: 'Temperature (°C)',
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
        AG Charts Line Example
      </Styled.Title>
      <Styled.Title group="heading" variant="h5">
        Temperature trends with multiple series and different markers
      </Styled.Title>

      <Styled.AgChartContainer>
        <AgCharts style={{ height: '100%', width: '100%' }} options={lineChartOptions} />
      </Styled.AgChartContainer>
    </Styled.Main>
  );
};

export default AgLine;

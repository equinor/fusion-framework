import type { AgChartOptions } from 'ag-charts-community';
import { marketShareData } from './Data';
import { type ReactElement, useMemo } from 'react';
import Styled from '../../App.style';
import { AgCharts } from '@equinor/fusion-framework-react-ag-grid/charts';

/**
 * AgPie Component - Pie Chart Visualization
 *
 * Displays a pie chart showing market share distribution across different platforms.
 * This component demonstrates how to create a pie chart with custom colors and proper
 * styling using AG Charts.
 *
 * @returns {ReactElement} A rendered pie chart showing market share distribution
 */
export const AgPie = (): ReactElement => {
  // Pie Chart Configuration
  const pieChartOptions = useMemo<AgChartOptions>(
    () => ({
      data: marketShareData,
      title: {
        text: 'Market Share Distribution',
        fontSize: 18,
        fontWeight: 'bold',
      },
      subtitle: {
        text: 'Platform Usage Breakdown',
      },
      series: [
        {
          type: 'pie',
          angleKey: 'share',
          fills: marketShareData.map((d) => d.color),
          strokes: marketShareData.map((d) => d.color),
          title: {
            text: 'Platforms',
          },
        },
      ],
      legend: {
        position: 'left',
      },
    }),
    [],
  );

  return (
    <Styled.Main>
      <Styled.Title group="heading" variant="h2">
        AG Charts Pie Example
      </Styled.Title>
      <Styled.Title group="heading" variant="h5">
        Market share distribution with custom colors and donut style
      </Styled.Title>

      <Styled.AgChartContainer>
        <AgCharts style={{ height: '100%', width: '100%' }} options={pieChartOptions} />
      </Styled.AgChartContainer>
    </Styled.Main>
  );
};

export default AgPie;

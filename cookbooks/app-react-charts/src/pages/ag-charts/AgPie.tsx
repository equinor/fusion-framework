import type { AgChartOptions } from 'ag-charts-community';
import { marketShareData } from './Data';
import { useMemo } from 'react';
import Styled from '../../App.style';
import { AgCharts } from 'ag-charts-react';

export const AgPie = (): JSX.Element => {
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

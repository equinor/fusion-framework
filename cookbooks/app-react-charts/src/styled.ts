import { Typography } from '@equinor/eds-core-react';
import type { ComponentProps } from 'react';
import styled from 'styled-components';
import type { IStyledComponent } from 'styled-components';

const Main = styled.div`
    width: 100%;
    max-width: 700px;
    padding: 25px 0;
  `;

const Title: IStyledComponent<'web', ComponentProps<typeof Typography>> = styled(Typography)`
    margin-bottom: 10px;
  `;

const AgChartContainer = styled.div`
    height: 500px;
    width: 100%;
    border: 1px solid #ddd;
    background-color: #fafafa;
    margin-top: 10px;
  `;

const Styled: {
  Main: typeof Main;
  Title: typeof Title;
  AgChartContainer: typeof AgChartContainer;
} = { Main, Title, AgChartContainer };

export default Styled;

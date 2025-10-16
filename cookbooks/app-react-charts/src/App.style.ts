import { Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

export const Styled = {
  Main: styled.div`
    width: 100%;
    max-width: 700px;
    padding: 25px 0;
  `,
  Title: styled(Typography)`
    margin-bottom: 10px;
  `,
  AgChartContainer: styled.div`
    height: 500px;
    width: 100%;
    border: 1px solid #ddd;
    background-color: #fafafa;
    margin-top: 10px;
  `,
};

export default Styled;

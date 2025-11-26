import { LinearProgress, Typography } from '@equinor/eds-core-react';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';

const Styled = {
  Container: styled.div`
    padding: ${tokens.spacings.comfortable.medium};
  `,
  Heading: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.x_small};
  `,
};

/**
 * Loader component that displays a linear progress indicator
 */
export const Loader = () => {
  return (
    <Styled.Container>
      <Styled.Heading variant="h3">Loading...</Styled.Heading>
      <LinearProgress />
    </Styled.Container>
  );
};

export default Loader;

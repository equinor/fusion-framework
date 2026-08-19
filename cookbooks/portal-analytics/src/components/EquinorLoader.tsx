import type React from 'react';
import { Progress, Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  `,
};

/**
 * Component to show the Equinor logo while loading content
 */
export const EquinorLoader = ({
  children,
  text,
}: React.PropsWithChildren<{ readonly text: string }>): JSX.Element => {
  return (
    <Styled.Wrapper>
      <Progress.Star aria-label={text} />
      <Typography aria-hidden="true">{text}</Typography>
      {children}
    </Styled.Wrapper>
  );
};

export default EquinorLoader;

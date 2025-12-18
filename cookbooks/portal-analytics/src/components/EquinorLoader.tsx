import type React from 'react';
import { StarProgress } from '@equinor/fusion-react-progress-indicator';
import styled from 'styled-components';

const Styled = {
  Wrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
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
      <StarProgress text={text}>{children}</StarProgress>
    </Styled.Wrapper>
  );
};

export default EquinorLoader;

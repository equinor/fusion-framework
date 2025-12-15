import { useId } from 'react';
import { ContextSelector } from '../ContextSelector/ContextSelector';
import { FusionLogo } from './FusionLogo';

import styled from 'styled-components';
import { TopBar } from '@equinor/eds-core-react';

const Styled = {
  TopBar: styled(TopBar)`
    padding: 0 1em;
    height: 48px;
  `,
  Title: styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1rem;
    font-weight: 500;
  `,
};

export const Header = () => {
  const topBarId = useId();

  return (
    <Styled.TopBar id={topBarId} sticky={false}>
      <TopBar.Header>
        <Styled.Title>
          <FusionLogo />
          <span>Fusion Framework CLI</span>
        </Styled.Title>
      </TopBar.Header>
      <TopBar.CustomContent>
        <ContextSelector />
      </TopBar.CustomContent>
      {/* since buttons are 40px but have 48px click bounds */}
    </Styled.TopBar>
  );
};

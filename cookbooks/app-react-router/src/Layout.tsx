import { Outlet, useNavigation } from 'react-router-dom';
import { tokens } from '@equinor/eds-tokens';
import { Paper, Typography } from '@equinor/eds-core-react';
import Navigation from './components/Navigation';
import RouterDebugToolbar from './components/RouterDebugToolbar';
import Loader from './components/Loader';
import styled from 'styled-components';

const Styled = {
  Wrapper: styled.div`
    display: grid;
    grid-template-rows: 75px auto;
    height: inherit;
  `,
  Header: styled.header`
    padding: 0 ${tokens.spacings.comfortable.x_small};
    background-color: ${tokens.colors.interactive.primary__resting.hex};
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  Container: styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    background-color: ${tokens.colors.ui.background__light.hex};
    overflow: hidden;
    height: calc(100vh - 123px);
  `,
  Content: styled.div`
    max-width: 1200px;
    width: 100%;
    overflow-y: auto;
  `,
  ContentContainer: styled(Paper)`
    min-height: calc(100vh - (75px + 48px + 4rem));
    padding: ${tokens.spacings.comfortable.large} ${tokens.spacings.comfortable.xx_large};
  `,
  Title: styled(Typography)`
    color: ${tokens.colors.text.static_icons__primary_white.hex};
  `,
};

export default function Layout() {
  const { state: loadingState } = useNavigation();

  return (
    <Styled.Wrapper>
      <Styled.Header>
        <Styled.Title variant="h1" group="heading">
          Cookbook - React Router App
        </Styled.Title>
        <RouterDebugToolbar />
      </Styled.Header>
      <Styled.Container>
        <Navigation />
        <Styled.Content>
          <Styled.ContentContainer elevation="raised">
            {loadingState === 'loading' && <Loader />}
            {loadingState === 'idle' && <Outlet />}
          </Styled.ContentContainer>
        </Styled.Content>
      </Styled.Container>
    </Styled.Wrapper>
  );
}

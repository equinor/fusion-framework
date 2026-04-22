import { Outlet, Router as FusionRouter, useParams } from '@equinor/fusion-framework-react-router';
import { AppLoader } from './AppLoader';
import { Header } from './components/Header';

import { styled } from 'styled-components';
import { Portal } from './Portal';
import { useAppContextNavigation } from './useAppContextNavigation';

const Styled = {
  ContentContainer: styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 48px 1fr;
    height: 100vh;
    overflow: hidden;
    grid-template-areas: 'head' 'main';
  `,
  Head: styled.section`
    grid-area: head;
  `,
  Main: styled.section`
    grid-area: main;
    overflow: auto;
    position: relative;
    max-width: 100%;
    display: grid;
  `,
};

/**
 * Root layout component for the portal analytics app.
 *
 * Renders the header, portal panel, and a scrollable main area via `Outlet`.
 */
const Root = () => {
  return (
    <Styled.ContentContainer>
      <Styled.Head>
        <Header />
      </Styled.Head>
      <Styled.Main>
        <Portal />
        <Outlet />
      </Styled.Main>
    </Styled.ContentContainer>
  );
};

/**
 * Route component that extracts the `appKey` parameter and delegates to {@link AppLoader}.
 */
// eslint-disable-next-line react/no-multi-comp
const AppRoute = () => {
  const { appKey } = useParams();
  return appKey ? <AppLoader appKey={appKey} /> : null;
};

/** Route definitions for the portal analytics app. */
const routes = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'apps/:appKey/*',
        element: <AppRoute />,
      },
    ],
  },
];

/**
 * Top-level router for the Fusion Portal Analytics app.
 *
 * Renders the application via `FusionRouter`. Observes context changes through
 * {@link useAppContextNavigation} to keep the URL in sync.
 */
// eslint-disable-next-line react/no-multi-comp
export const Router = () => {
  // observe the context changes and navigate when the context changes
  useAppContextNavigation();
  return <FusionRouter routes={routes} />;
};

import { useBookmarkNavigate } from '@equinor/fusion-framework-react-module-bookmark/portal';

import { Router as FusionRouter, Outlet, useParams } from '@equinor/fusion-framework-react-router';
import AppLoader from './AppLoader';
import { Header } from './Header';

import { styled } from 'styled-components';

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
 * Root layout component for the dev portal.
 *
 * Renders the header and a scrollable main area via `Outlet`. Activates
 * bookmark-to-navigation linking through `useBookmarkNavigate`.
 */
const Root = () => {
  useBookmarkNavigate({ resolveAppPath: (appKey: string) => `/apps/${appKey}` });
  return (
    <Styled.ContentContainer>
      <Styled.Head>
        <Header />
      </Styled.Head>
      <Styled.Main>
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

/** Route definitions for the dev portal. */
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
 * Top-level router for the Fusion Dev Portal.
 *
 * Uses `@equinor/fusion-framework-react-router` which automatically connects
 * to the framework's navigation module for history and basename.
 */
// eslint-disable-next-line react/no-multi-comp
export const Router = () => {
  return <FusionRouter routes={routes} />;
};

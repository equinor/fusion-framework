import { useBookmarkNavigate } from '@equinor/fusion-framework-react-module-bookmark/portal';

import { Outlet, Router as FusionRouter, useParams } from '@equinor/fusion-framework-react-router';
import AppLoader from './AppLoader';
import { Header } from './Header';

import { styled } from 'styled-components';
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
        /**
         * Give the portal chrome (Header/TopBar and its ContextSelector
         * dropdown) an explicit stacking context comfortably above the
         * small, incidental z-index values apps tend to use for ordinary
         * layout elements (sticky headers, dropdowns, etc.), so those can
         * never leak above the portal chrome. Deliberately kept well below
         * the z-index range conventionally used by real overlay/backdrop
         * components (e.g. modal libraries typically use 1000+), so an
         * app's intentional fullscreen scrim (e.g. opening a sidepanel)
         * can still render above the header when that's the desired UX.
         */
        position: relative;
        z-index: 10;
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
 * Renders the application via `FusionRouter`. Observes context changes through
 * {@link useAppContextNavigation} to keep the URL in sync.
 */
// eslint-disable-next-line react/no-multi-comp
export const Router = () => {
  // observe the context changes and navigate when the context changes
  useAppContextNavigation();
  return <FusionRouter routes={routes} />;
};

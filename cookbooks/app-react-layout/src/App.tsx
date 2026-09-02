import type { ReactElement } from 'react';
import { Layout } from '@equinor/fusion-react-layout';
import { Outlet, Router, type RouteObject } from '@equinor/fusion-framework-react-router';
import { FavouritesPage } from './pages/FavouritesPage';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { Sidebar } from './Sidebar';

/** Provides the shared sidebar and content regions for every route. */
const AppLayout = (): ReactElement => (
  <Layout>
    <Layout.Sidebar>
      <Sidebar />
    </Layout.Sidebar>
    <Layout.Content>
      <Outlet />
    </Layout.Content>
  </Layout>
);

const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'history', Component: HistoryPage },
      { path: 'favourites', Component: FavouritesPage },
    ],
  },
];

/** Initializes routed pages for the React layout cookbook. */
export const App = (): ReactElement => <Router routes={routes} />;

export default App;

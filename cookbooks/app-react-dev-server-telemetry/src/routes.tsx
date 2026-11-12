import { Link, Outlet, type RouteObject } from '@equinor/fusion-framework-react-router';

import { HomePage } from './pages/HomePage';

/**
 * Two routes are enough to produce navigation telemetry. The details link carries a sentinel
 * search parameter that must never appear in the collector.
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <div style={{ padding: '1rem' }}>
        <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <Link to="/">Home</Link>
          <Link to="/details?token=never-exported">Details</Link>
        </nav>
        <Outlet />
      </div>
    ),
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'details',
        element: <p>Details page. Navigate back to Home to record another navigation.</p>,
      },
    ],
  },
];

export default routes;

import type { RouteObject } from '@equinor/fusion-framework-react-router';
import { Link, Outlet } from '@equinor/fusion-framework-react-router';

import { HomePage } from './pages/HomePage';
import {
  ErrorElementPage,
  ErrorElementBoundary,
  clientLoader as errorElementLoader,
} from './pages/ErrorElementPage';
import { ErrorBoundaryPage, ErrorBoundaryComponent } from './pages/ErrorBoundaryPage';
import { RootErrorBoundary } from './pages/RootErrorBoundary';

/**
 * Routes defined as a plain RouteObject[] (the "legacy" / manual approach).
 *
 * Key points demonstrated here:
 *  - `errorElement` accepts a ComponentType, NOT a rendered JSX element.
 *    The Fusion router wraps it and injects `error` and `fusion` as props.
 *  - `ErrorBoundary` works exactly as in React Router v7, and also receives
 *    `error` and `fusion` props from the Fusion router.
 *
 * This contrasts with the DSL (route()/layout()/index()) approach where
 * `export function ErrorElement` in a page file is wired automatically.
 */
const routes: RouteObject[] = [
  {
    path: '/',
    // ErrorBoundary on the root catches anything not handled by child routes.
    ErrorBoundary: RootErrorBoundary,
    element: (
      <div style={{ padding: '1rem' }}>
        <nav style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <Link to="/">Home</Link>
          <Link to="/error-element">errorElement demo</Link>
          <Link to="/error-boundary">ErrorBoundary demo</Link>
        </nav>
        <Outlet />
      </div>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'error-element',
        // errorElement: a ComponentType — the Fusion router injects `error` and `fusion` as props.
        // Do NOT pass a rendered element (<ErrorElementBoundary />) here; pass the component directly.
        errorElement: ErrorElementBoundary,
        // loader throws, so errorElement is actually exercised (see ErrorElementPage.tsx).
        loader: errorElementLoader,
        element: <ErrorElementPage />,
      },
      {
        path: 'error-boundary',
        // ErrorBoundary: React Router v7 style — the component calls useRouteError() internally,
        // but the Fusion router also injects `error` and `fusion` as props for convenience.
        ErrorBoundary: ErrorBoundaryComponent,
        element: <ErrorBoundaryPage />,
      },
    ],
  },
];

export default routes;

import { Outlet } from '@equinor/fusion-framework-react-router';

import type { ReactElement } from 'react';

/**
 * Shared page shell for all routes — the router renders matched child routes into the `Outlet`.
 *
 * @returns The page shell element.
 */
export default function Layout(): ReactElement {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f0f0',
        color: '#343434',
      }}
    >
      <Outlet />
    </div>
  );
}

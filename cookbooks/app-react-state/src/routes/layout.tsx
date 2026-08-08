import { Link, Outlet, useLocation } from '@equinor/fusion-framework-react-router';

import { SyncStatusMonitor } from '../components/SyncEvents/SyncStatusMonitor';

import { SideBar } from '@equinor/eds-core-react';
import { home, school, settings, offline_document } from '@equinor/eds-icons';

// A route is active on an exact match or on any of its `/*` sub-paths.
const isActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/** Provides the cookbook navigation and sync monitor shell. */
export const Root = () => {
  const currentLocation = useLocation();
  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '300px' }}>
        <div style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', zIndex: 100 }}>
          <SideBar open>
            <SideBar.Link
              icon={home}
              as={Link}
              to="/"
              label="home"
              active={currentLocation.pathname === '/'}
            />
            <SideBar.Link
              icon={school}
              as={Link}
              to="/basics"
              label="basics"
              active={isActive(currentLocation.pathname, '/basics')}
            />
            <SideBar.Link
              icon={settings}
              as={Link}
              to="/profile"
              label="profile"
              active={isActive(currentLocation.pathname, '/profile')}
            />
            <SideBar.Link
              icon={offline_document}
              as={Link}
              to="/todos"
              label="todos"
              active={isActive(currentLocation.pathname, '/todos')}
            />
          </SideBar>
        </div>
        <main style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Outlet />
        </main>
      </div>
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          height: '300px',
        }}
      >
        <SyncStatusMonitor height="300px" />
      </div>
    </div>
  );
};

export default Root;

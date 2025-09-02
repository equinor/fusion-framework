import { Link, Outlet, useLocation } from 'react-router-dom';

import { SyncStatusMonitor } from '../components/SyncEvents/SyncStatusMonitor';

import { SideBar } from '@equinor/eds-core-react';
import { home, settings, offline_document } from '@equinor/eds-icons';

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
              icon={settings}
              as={Link}
              to="/profile"
              label="profile"
              active={currentLocation.pathname === '/profile'}
            />
            <SideBar.Link
              icon={offline_document}
              as={Link}
              to="/todos"
              label="todos"
              active={currentLocation.pathname === '/todos'}
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

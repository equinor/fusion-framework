import type { ReactElement } from 'react';
import { SideBar } from '@equinor/eds-core-react';
import { useLocation, useNavigate } from '@equinor/fusion-framework-react-router';

/** Renders route-aware navigation for the layout cookbook. */
export const Sidebar = (): ReactElement => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <SideBar open>
      <SideBar.Content>
        <SideBar.Toggle />
        <SideBar.Link
          icon={{
            height: '24',
            name: 'home',
            prefix: 'eds',
            svgPathData:
              'M5 12.5H2l10-9 10 9h-3v8h-6v-6h-2v6H5zm12-1.81-5-4.5-5 4.5v7.81h2v-6h6v6h2z',
            width: '24',
          }}
          label="Home"
          title="Home"
          active={pathname === '/'}
          onClick={() => navigate('/')}
        />
        <SideBar.Link
          icon={{
            height: '24',
            name: 'history',
            prefix: 'eds',
            svgPathData:
              'M4.5 12a9 9 0 1 1 9 9c-2.49 0-4.73-1.01-6.36-2.64l1.42-1.42A6.94 6.94 0 0 0 13.5 19c3.87 0 7-3.13 7-7s-3.13-7-7-7-7 3.13-7 7h3l-4.04 4.03-.07-.14L1.5 12zm8 1V8H14v4.15l3.52 2.09-.77 1.28z',
            width: '24',
          }}
          label="History"
          title="History"
          active={pathname === '/history'}
          onClick={() => navigate('/history')}
        />
        <SideBar.Link
          icon={{
            height: '24',
            name: 'favorite_outlined',
            prefix: 'eds',
            svgPathData:
              'M12 4.915c1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.42 5.5 5.5 0 3.777-3.394 6.855-8.537 11.519l-.013.011-1.45 1.32-1.45-1.31-.04-.036C5.384 15.17 2 12.095 2 8.325c0-3.08 2.42-5.5 5.5-5.5 1.74 0 3.41.81 4.5 2.09m0 13.56.1-.1c4.76-4.31 7.9-7.16 7.9-10.05 0-2-1.5-3.5-3.5-3.5-1.54 0-3.04.99-3.56 2.36h-1.87c-.53-1.37-2.03-2.36-3.57-2.36-2 0-3.5 1.5-3.5 3.5 0 2.89 3.14 5.74 7.9 10.05z',
            width: '24',
          }}
          label="Favourites"
          title="Favourites"
          active={pathname === '/favourites'}
          onClick={() => navigate('/favourites')}
        />
      </SideBar.Content>
    </SideBar>
  );
};

export default Sidebar;

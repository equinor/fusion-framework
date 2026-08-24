import { Outlet } from '@equinor/fusion-framework-react-router';

/**
 * Shared page shell for all routes — the router renders matched child routes into the `Outlet`.
 */
export default function Layout() {
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

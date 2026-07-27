import { Outlet } from 'react-router';

export const handle = {
  route: {
    description: 'Main layout',
  },
};

/**
 * Mock layout used in router tests, rendering nested routes via `Outlet`.
 *
 * @returns The layout
 */
export default function MainLayout() {
  return (
    <div>
      <header>Main Layout</header>
      <Outlet />
    </div>
  );
}

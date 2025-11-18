import { Outlet } from 'react-router-dom';

export const handle = {
  route: {
    description: 'Main layout',
  },
};

export default function MainLayout() {
  return (
    <div>
      <header>Main Layout</header>
      <Outlet />
    </div>
  );
}


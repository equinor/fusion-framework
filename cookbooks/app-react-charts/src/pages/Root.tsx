import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Root = () => {
  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <Navigation />
      <div style={{ flexGrow: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Root;

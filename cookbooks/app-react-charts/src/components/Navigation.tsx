import { SideBar, type SidebarLinkProps } from '@equinor/eds-core-react';
import { home, bar_chart, timeline } from '@equinor/eds-icons';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navigation = () => {
  const navigate = useNavigate();
  const currentLocation = useLocation();

  const currentPath = currentLocation.pathname;

  const menuItems: SidebarLinkProps[] = [
    {
      label: 'Home',
      icon: home,
      onClick: () => navigate('/'),
      active: currentPath === '/',
    },
    {
      label: 'Bar Chart',
      icon: bar_chart,
      onClick: () => navigate('bar-chart'),
      active: currentPath.startsWith('/bar-chart'),
    },
    {
      label: 'Line Chart',
      icon: timeline,
      onClick: () => navigate('line-chart'),
      active: currentPath.startsWith('/line-chart'),
    },
  ];

  return (
    <SideBar open>
      <SideBar.Content>
        <SideBar.Toggle />
        {menuItems.map((menuItem) => (
          <div key={menuItem.label}>
            <SideBar.Link
              label={menuItem.label}
              title={menuItem.label}
              icon={menuItem.icon}
              onClick={menuItem.onClick}
              active={menuItem.active}
            />
          </div>
        ))}
      </SideBar.Content>
    </SideBar>
  );
};

export default Navigation;

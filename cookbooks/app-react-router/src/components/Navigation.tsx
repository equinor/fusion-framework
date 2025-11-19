import { SideBar, type SidebarLinkProps } from '@equinor/eds-core-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationItems } from '../hooks/useNavigationItems';
import { pages } from '../pages';

export const Navigation = () => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const navigationItems = useNavigationItems(pages);

  const currentPath = currentLocation.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const menuItems: SidebarLinkProps[] = navigationItems.map((item) => ({
    label: item.label,
    icon: item.icon,
    onClick: () => navigate(item.path),
    active: isActive(item.path),
  }));

  return (
    <SideBar open>
      <SideBar.Toggle />
      <SideBar.Content>
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

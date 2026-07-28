import { SideBar, type SidebarLinkProps } from '@equinor/eds-core-react';
import { useNavigate, useLocation } from '@equinor/fusion-framework-react-router';
import type { RouteObject } from '@equinor/fusion-framework-react-router';
import { useNavigationItems } from '../hooks/useNavigationItems';
import { pages } from '../pages';

/**
 * Renders sidebar links for the current route tree and navigates on selection.
 * @returns The application sidebar navigation.
 */
export const Navigation = () => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const navigationItems = useNavigationItems(pages as RouteObject[]);

  const currentPath = currentLocation.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  // Adapt route metadata to the sidebar link shape used by the design system.
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
        {/* Render each route item as a clickable sidebar entry. */}
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

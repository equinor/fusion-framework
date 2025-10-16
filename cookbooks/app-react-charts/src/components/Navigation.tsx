import { SideBar, type SidebarLinkProps } from '@equinor/eds-core-react';
import { home, bar_chart, timeline, pie_chart } from '@equinor/eds-icons';
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

  const agChartItems = [
    {
      label: 'Bar',
      onClick: () => navigate('ag-chart/bar'),
      active: currentPath.startsWith('/ag-chart/bar'),
    },
    {
      label: 'Pie',
      onClick: () => navigate('ag-chart/pie'),
      active: currentPath.startsWith('/ag-chart/pie'),
    },
    {
      label: 'Line',
      onClick: () => navigate('ag-chart/line'),
      active: currentPath.startsWith('/ag-chart/line'),
    },
    {
      label: 'Area',
      onClick: () => navigate('ag-chart/area'),
      active: currentPath.startsWith('/ag-chart/area'),
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
        <SideBar.Accordion label="AG Charts" icon={pie_chart} isExpanded={true}>
          {agChartItems.map((item) => (
            <div key={item.label}>
              <SideBar.AccordionItem
                label={item.label}
                onClick={item.onClick}
                active={item.active}
              />
            </div>
          ))}
        </SideBar.Accordion>
      </SideBar.Content>
    </SideBar>
  );
};

export default Navigation;

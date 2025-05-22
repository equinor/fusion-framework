import { SideBar, SidebarLinkProps } from "@equinor/eds-core-react";
import { list, support, search, home, bar_chart } from "@equinor/eds-icons";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
	const navigate = useNavigate();
	const currentLocation = useLocation();

	const currentPath = currentLocation.pathname;

	const menuItems: SidebarLinkProps[] = [
		{
			label: "Home",
			icon: home,
			onClick: () => navigate("/"),
			active: currentPath === "/"
		},
		{
			label: "Chart 1",
			icon: bar_chart,
			onClick: () => navigate("chart1"),
			active: currentPath === "/chart1"
		},
		{
			label: "Chart 2",
			icon: bar_chart,
			onClick: () => navigate("chart2"),
			active: currentPath === "/chart2"
		}
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

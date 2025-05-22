import { Outlet, type RouteObject } from "react-router-dom";
import Navigation from "./components/Navigation";
import { ChartOne } from "./pages/ChartOne";
import { ChartTwo } from "./pages/ChartTwo";

const Root = () => {
	return (
		<div style={{ display: "flex", gap: 20 }}>
			<Navigation />
			<Outlet />
		</div>
	);
};

export const routes: RouteObject[] = [
	{
		path: "/",
		element: <Root />,
		children: [
			{
				index: true,
				element: <h1>Home</h1>
			},
			{
				path: "chart1/*",
				Component: ChartOne
			},
			{
				path: "chart2/*",
				Component: ChartTwo
			}
		]
	}
];

export default routes;

import {
  Route as ReactRouterRoute,
  Routes as ReactRouterRoutes,
  MemoryRouter as ReactRouterMemoryRouter,
  RouterProvider as ReactRouterRouterProvider,
  createMemoryRouter as reactRouterCreateMemoryRouter,
} from 'react-router';

export type {
  MemoryRouterProps,
  RouterProviderProps,
} from 'react-router';

/**
 * Interop re-export of `MemoryRouter` from `react-router`.
 *
 * Useful for wrapping components in unit tests or embedding isolated widgets
 * that must not interact with the host page URL. Teams already using
 * `MemoryRouter` for testing can continue importing from this interop entry
 * point while migrating to a direct `react-router` dependency.
 *
 * @deprecated Interop export. This will be removed in a future major version.
 */
export const MemoryRouter: typeof ReactRouterMemoryRouter = ReactRouterMemoryRouter;

/**
 * Interop re-export of `RouterProvider` from `react-router`.
 *
 * Provided for teams that pair `createMemoryRouter` with `RouterProvider` in
 * tests or storybook setups and want a single import path while transitioning
 * away from this package's legacy entry point.
 *
 * @deprecated Interop export. This will be removed in a future major version.
 */
export const RouterProvider: typeof ReactRouterRouterProvider = ReactRouterRouterProvider;

/**
 * Interop re-export of `createMemoryRouter` from `react-router`.
 *
 * Useful for building test routers that support loaders, actions, and nested
 * routes without touching browser history. Teams using this for component or
 * integration tests can keep importing from this interop entry point while
 * migrating to a direct `react-router` dependency.
 *
 * @deprecated Interop export. This will be removed in a future major version.
 */
export const createMemoryRouter: typeof reactRouterCreateMemoryRouter = reactRouterCreateMemoryRouter;

/**
 * Interop re-export of `Routes` from `react-router`.
 *
 * Teams migrating from React Router v6 JSX-based routing can use this while
 * transitioning to the Fusion route schema DSL or `RouteObject`-based routing.
 *
 * @deprecated Use the Fusion DSL (`Route`, `IndexRoute`, `LayoutRoute`) or a
 * `RouteObject` array passed to `<Router>` instead.
 */
export const Routes: typeof ReactRouterRoutes = ReactRouterRoutes;

/**
 * Interop re-export of `Route` from `react-router`.
 *
 * Teams migrating from React Router v6 JSX-based routing can use this while
 * transitioning to the Fusion route schema DSL or `RouteObject`-based routing.
 *
 * @deprecated Use the Fusion DSL (`Route`, `IndexRoute`, `LayoutRoute`) or a
 * `RouteObject` array passed to `<Router>` instead.
 */
export const Route: typeof ReactRouterRoute = ReactRouterRoute;

import { useMemo } from 'react';
import { useNavigationModule } from './useNavigationModule';
import type { INavigationProvider } from '@equinor/fusion-framework-module-navigation';

/**
 * React hook that creates a router instance for client-side navigation.
 *
 * The `routes` argument **must** be static or memoised to avoid re-creating
 * the router on every render.
 *
 * @param routes - An array of route objects compatible with
 *   `INavigationProvider.createRouter`.
 * @returns A router instance to pass to `<RouterProvider>`.
 *
 * @see {@link https://equinor.github.io/fusion-framework/modules/navigation/ | Fusion navigation docs}
 * @see {@link https://reactrouter.com/en/main/routers/create-browser-router | react-router docs}
 *
 * @example
 * ```tsx
 * import { useRouter } from '@equinor/fusion-framework-react-app/navigation';
 * import { RouterProvider } from '@equinor/fusion-framework-react-router';
 *
 * const routes = [{ path: '/', element: <Home /> }];
 * const App = () => {
 *   const router = useRouter(routes);
 *   return <RouterProvider router={router} />;
 * };
 * ```
 */
export const useRouter = (
  routes: Parameters<INavigationProvider['createRouter']>[0],
): ReturnType<INavigationProvider['createRouter']> => {
  const provider = useNavigationModule();
  return useMemo(() => provider.createRouter(routes), [provider, routes]);
};

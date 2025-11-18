import { useMemo } from 'react';
import { RouterProvider } from 'react-router/dom';
import {
  type Modules,
  type ModulesInstanceType,
  useModules,
} from '@equinor/fusion-framework-react-module';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { RouterContextProvider, UNSAFE_createRouter } from 'react-router';
import type { FusionRouterContext, RouteNode, RouterContext } from './types.js';
import { createRoutes } from './routes/create-routes.js';
import { routerContext } from './context.js';

type RouterProps = {
  routes: RouteNode | RouteNode[];
  loader?: React.ReactElement;
  context?: RouterContext;
};

/**
 * Router component that integrates React Router v7 with Fusion Framework.
 * 
 * This component sets up a React Router instance that:
 * - Connects to Fusion Framework's navigation module for history and basename
 * - Injects Fusion modules and context into all route loaders, actions, and components
 * - Supports lazy loading of route components with automatic code splitting
 * 
 * @param routes - Single route node or array of route nodes defining the application routes
 * @param loader - Optional React element to display while routes are loading
 * @param context - Optional context object that will be available in route loaders and components via `fusion.context`
 * 
 * @example
 * ```tsx
 * import { Router } from '@equinor/fusion-framework-react-router';
 * import { pages } from './routes';
 * 
 * export default function AppRouter() {
 *   return <Router routes={pages} />;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * import { Router } from '@equinor/fusion-framework-react-router';
 * import { QueryClient } from '@tanstack/react-query';
 * 
 * export default function AppRouter() {
 *   const queryClient = new QueryClient();
 *   return (
 *     <Router 
 *       routes={routes} 
 *       context={{ queryClient }}
 *       loader={<LoadingSpinner />}
 *     />
 *   );
 * }
 * ```
 */
export function Router({ routes, loader, context }: RouterProps) {
  const modules = useModules();

  const router = useMemo(() => {
    const { navigation } = modules as unknown as ModulesInstanceType<{
      navigation: NavigationModule;
    }>;
    const fusionRouterContext: FusionRouterContext = {
      context,
      modules: modules as unknown as ModulesInstanceType<Modules>,
    } as FusionRouterContext;

    const contextProvider = new RouterContextProvider(new Map([[routerContext, fusionRouterContext]]));

    const routerInstance = UNSAFE_createRouter({
      routes: createRoutes(routes, { loader, context: fusionRouterContext }),
      history: navigation.history,
      basename: navigation.basename,
      getContext: () => {
        return contextProvider;
      },
    });
    return routerInstance.initialize();
  }, [routes, modules, context, loader]);

  return <RouterProvider router={router} />;
}

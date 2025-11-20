import { useMemo } from 'react';
import { RouterProvider } from 'react-router/dom';
import {
  type Modules,
  type ModulesInstanceType,
  useModules,
} from '@equinor/fusion-framework-react-module';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { RouterContextProvider, UNSAFE_createRouter, useActionData, useLoaderData, useRouteError } from 'react-router';
import type { FusionRouterContext, RouteNode, RouteObject, RouterContext } from './types.js';
import { createRoutes } from './routes/create-routes.js';
import { FusionRouterContextProvider, routerContext, useRouterContext } from './context.js';
import route from './routes/Route.js';
import React from 'react';

type RouterProps = {
  routes: RouteNode | RouteNode[] | RouteObject | RouteObject[];
  loader?: React.ReactElement;
  context?: RouterContext;
};

// Check if routes are already RouteObjects (transformed by plugin) or RouteNodes (DSL)
const isRouteObject = (route: unknown): boolean => {
  if (route == null || typeof route !== 'object') return false;
  // RouteNodes have a toRouteObject method, RouteObjects don't
  return !('toRouteObject' in route) && ('path' in route || 'lazy' in route || 'element' in route || 'children' in route);
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

  const fusionRouterContext: FusionRouterContext = useMemo(() => {
    return {
      context,
      modules: modules as unknown as ModulesInstanceType<Modules>,
    } as FusionRouterContext;
  }, [context, modules]);

  console.log(9999, 'fusionRouterContext', routes);

  const router = useMemo(() => {
    const { navigation } = modules as unknown as ModulesInstanceType<{
      navigation: NavigationModule;
    }>;

    const contextProvider = new RouterContextProvider(
      new Map([[routerContext, fusionRouterContext]]),
    );

    const routerInstance = UNSAFE_createRouter({
      routes: routes as RouteObject[],
      history: navigation.history,
      basename: navigation.basename,
      getContext: () => {
        return contextProvider;
      },
      // @ts-ignore
      mapRouteProperties: (route: RouteObject) => {
        if(route.loader) {
          const originalLoader = route.loader;
          route.loader = function __FusionRouterLoader(args) {
            const fusion = args.context.get(routerContext);
            // @ts-expect-error
            return originalLoader({ ...args, fusion });
          };
        }
        if(route.action) {
          const originalAction = route.action;
          route.action = function __FusionRouterAction(args) {
            const fusion = args.context.get(routerContext);
            // @ts-expect-error
            return originalAction({ ...args, fusion });
          };
        }
        // Process handle - ensure it has the correct RouterHandle structure
        if (route.handle && typeof route.handle === 'object') {
          // Ensure handle.route exists, but preserve all other properties
          // Create a new object to avoid mutation issues
          const existingHandle = route.handle;
          route.handle = {
            ...existingHandle,
            route: existingHandle.route || {},
            elg: 'bert'
          };
          console.log(999, 'route.handle AFTER processing', route.handle);
        } else {
          console.log(666, 'Should not happen', route);
          // Initialize handle if it doesn't exist
          route.handle = { route: {} };
        }
        if(route.errorElement) {
          const originalErrorElement = route.errorElement;
          // Wrap errorElement component to inject error and fusion context as props
          // errorElement must be a React element, not a function
          route.errorElement = React.createElement(function __FusionRouterErrorElement() {
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const error = useRouteError();
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const fusion = useRouterContext();
            // @ts-expect-error - originalErrorElement is a component that accepts error and fusion props
            return React.createElement(originalErrorElement, { error, fusion });
          });
          route.hasErrorBoundary = true;
        }
        if(route.Component) {
          const originalComponent = route.Component;
          route.Component = function __FusionRouterComponent() {
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const loaderData = useLoaderData();
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const actionData = useActionData();
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const fusion = useRouterContext();
            // @ts-expect-error - originalComponent accepts fusion, loaderData, and actionData props
            return React.createElement(originalComponent, { fusion, loaderData, actionData });
          };
        }
        return route;
      },
    });
    return routerInstance.initialize();
  }, [routes, modules, fusionRouterContext]);

  return (
    <FusionRouterContextProvider value={fusionRouterContext}>
      <RouterProvider router={router} />
    </FusionRouterContextProvider>
  );
}

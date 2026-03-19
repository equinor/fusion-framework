import { useEffect, useMemo, useRef } from 'react';
import { RouterProvider } from 'react-router/dom';
import {
  type Modules,
  type ModulesInstanceType,
  useModules,
} from '@equinor/fusion-framework-react-module';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import {
  RouterContextProvider,
  UNSAFE_createRouter,
  useActionData,
  useLoaderData,
  useRouteError,
  type RouteObject as ReactRouterRouteObject,
} from 'react-router';
import type { FusionRouterContext, RouteNode, RouteObject, RouterContext } from './types.js';
import { FusionRouterContextProvider, routerContext, useRouterContext } from './context.js';
import React from 'react';

/**
 * Props accepted by the {@link Router} component.
 *
 * @property routes - A single route node, array of route nodes, or plain React Router `RouteObject` array.
 * @property loader - Optional React element shown while lazy route chunks are loading.
 * @property context - Custom object exposed as `fusion.context` in loaders, actions, and components.
 */
type RouterProps = {
  routes: RouteNode | RouteNode[] | RouteObject | RouteObject[];
  loader?: React.ReactElement;
  context?: RouterContext;
};

/**
 * Normalizes the routes prop into a flat array of React Router route objects.
 *
 * @param routes - Single route, array of routes, or mixed input.
 * @returns Array of route objects safe to pass to `UNSAFE_createRouter`.
 */
function normalizeRoutes(
  routes: RouteNode | RouteNode[] | RouteObject | RouteObject[],
): ReactRouterRouteObject[] {
  // Wrap a single route object in an array so the router always receives an array
  const routeArray = Array.isArray(routes) ? routes : [routes];
  return routeArray as ReactRouterRouteObject[];
}

/**
 * Router component that integrates React Router v7 with Fusion Framework.
 *
 * This component sets up a React Router instance that:
 * - Connects to Fusion Framework's navigation module for history and basename
 * - Injects Fusion modules and context into all route loaders, actions, and components
 * - Supports lazy loading of route components with automatic code splitting
 *
 * @param routes - Single route node or array of route nodes defining the application routes
 * @param context - Optional context object that will be available in route loaders and components via `fusion.context`
 * @param loader - Optional React element rendered while the router is initializing lazy routes
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
 *     />
 *   );
 * }
 * ```
 */
export function Router({ routes, context }: RouterProps) {
  const modules = useModules();

  const fusionRouterContext: FusionRouterContext = useMemo(() => {
    return {
      context,
      modules: modules as unknown as ModulesInstanceType<Modules>,
    } as FusionRouterContext;
  }, [context, modules]);

  // Store the context in a ref so route loaders/actions always read the
  // latest value without forcing a full router recreation.
  const fusionContextRef = useRef(fusionRouterContext);
  fusionContextRef.current = fusionRouterContext;

  const router = useMemo(() => {
    const { navigation } = modules as unknown as ModulesInstanceType<{
      navigation: NavigationModule;
    }>;

    const routerInstance = UNSAFE_createRouter({
      routes: normalizeRoutes(routes),
      history: navigation.history,
      basename: navigation.basename,
      getContext: () => {
        // Read from ref so the context provider always returns the current value
        return new RouterContextProvider(new Map([[routerContext, fusionContextRef.current]]));
      },
      // @ts-expect-error
      mapRouteProperties: (route: RouteObject) => {
        // Clone the route to avoid mutating the original objects.
        // Without this, re-creating the router would double-wrap loaders,
        // actions, and components — a common cause of blank pages.
        const mapped = { ...route };

        if (mapped.loader) {
          const originalLoader = mapped.loader;
          mapped.loader = function __FusionRouterLoader(args) {
            const fusion = args.context.get(routerContext);
            // @ts-expect-error
            return originalLoader({ ...args, fusion });
          };
        }
        if (mapped.action) {
          const originalAction = mapped.action;
          mapped.action = function __FusionRouterAction(args) {
            const fusion = args.context.get(routerContext);
            // @ts-expect-error
            return originalAction({ ...args, fusion });
          };
        }
        if (mapped.errorElement) {
          const originalErrorElement = mapped.errorElement;
          // Wrap errorElement component to inject error and fusion context as props
          // errorElement must be a React element, not a function
          mapped.errorElement = React.createElement(function __FusionRouterErrorElement() {
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const error = useRouteError();
            // biome-ignore lint/correctness/useHookAtTopLevel: hooks are used inside component function
            const fusion = useRouterContext();
            // @ts-expect-error - originalErrorElement is a component that accepts error and fusion props
            return React.createElement(originalErrorElement, { error, fusion });
          });
          mapped.hasErrorBoundary = true;
        }
        if (mapped.Component) {
          const originalComponent = mapped.Component;
          mapped.Component = function __FusionRouterComponent() {
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
        return mapped;
      },
    });
    return routerInstance.initialize();
    // Intentionally excluding fusionRouterContext — it is read via ref so
    // context updates do not destroy and recreate the entire router.
  }, [routes, modules]);

  // Dispose previous router instance when the router is recreated or unmounted
  // to clean up history listeners and pending navigations.
  useEffect(() => router.dispose.bind(router), [router]);

  return (
    <FusionRouterContextProvider value={fusionRouterContext}>
      <RouterProvider router={router} />
    </FusionRouterContextProvider>
  );
}

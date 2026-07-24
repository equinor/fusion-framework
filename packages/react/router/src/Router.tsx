import { useEffect, useMemo, useRef, useState } from 'react';
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
import type {
  ActionFunction,
  ErrorElement,
  FusionRouterContext,
  LoaderFunction,
  RouteNode,
  RouteObject,
  RouterComponent,
  RouterContext,
} from './types.js';
import { FusionRouterContextProvider, routerContext, useRouterContext } from './context.js';
import React from 'react';

// React Router's loader/action/component types as used internally.
type RRLoader = NonNullable<ReactRouterRouteObject['loader']>;
type RRAction = NonNullable<ReactRouterRouteObject['action']>;
type RRErrorBoundary = NonNullable<ReactRouterRouteObject['ErrorBoundary']>;
type RRComponent = NonNullable<ReactRouterRouteObject['Component']>;

// ---------------------------------------------------------------------------
// Route property wrappers
//
// Defined at module level so hooks called inside the returned components are
// always at the top of a named function — satisfying the hooks-at-top-level
// rule without suppression comments.
// ---------------------------------------------------------------------------

/** Wraps a route loader to inject the Fusion context as `fusion` in its args. */
function wrapLoader(original: RRLoader): RRLoader {
  return function __FusionRouterLoader(args) {
    const fusion = (args.context as RouterContextProvider).get(routerContext);
    return (original as unknown as LoaderFunction)({
      ...args,
      fusion,
    } as Parameters<LoaderFunction>[0]);
  };
}

/** Wraps a route action to inject the Fusion context as `fusion` in its args. */
function wrapAction(original: RRAction): RRAction {
  return function __FusionRouterAction(args) {
    const fusion = (args.context as RouterContextProvider).get(routerContext);
    return (original as unknown as ActionFunction)({
      ...args,
      fusion,
    } as Parameters<ActionFunction>[0]);
  };
}

/**
 * Wraps an error component (`errorElement` or `ErrorBoundary`) to inject the
 * caught route error and Fusion context as props.
 */
function wrapErrorComponent(Original: ErrorElement<unknown>): RRErrorBoundary {
  return function __FusionRouterErrorComponent() {
    const error = useRouteError();
    const fusion = useRouterContext();
    return React.createElement(Original, { error, fusion });
  };
}

/** Wraps a route component to inject `loaderData`, `actionData`, and `fusion` as props. */
function wrapComponent(Original: RouterComponent): RRComponent {
  return function __FusionRouterComponent() {
    const loaderData = useLoaderData();
    const actionData = useActionData();
    const fusion = useRouterContext();
    return React.createElement(Original, { fusion, loaderData, actionData });
  };
}

/**
 * Props accepted by the {@link Router} component.
 *
 * @property routes - A single route node, array of route nodes, or plain React Router `RouteObject` array.
 * @property loader - Optional React element shown while lazy route chunks are loading.
 * @property context - Custom object exposed as `fusion.context` in loaders, actions, and components.
 * @property useTransitions - Controls whether React Router wraps navigation state updates in `React.startTransition`.
 *   When `undefined` (the default), React Router decides based on its own internal logic.
 *   Set to `false` to opt out of transition wrapping — useful for apps experiencing UI flashing on route changes.
 */
type RouterProps = {
  routes: RouteNode | RouteNode[] | RouteObject | RouteObject[];
  loader?: React.ReactElement;
  context?: RouterContext;
  useTransitions?: boolean;
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
export function Router({
  routes,
  context,
  loader,
  useTransitions,
}: RouterProps): React.ReactElement | null {
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

    return UNSAFE_createRouter({
      routes: normalizeRoutes(routes),
      history: navigation.history,
      basename: navigation.basename,
      getContext: () => {
        // Read from ref so the context provider always returns the current value
        return new RouterContextProvider(new Map([[routerContext, fusionContextRef.current]]));
      },
      // @ts-expect-error — mapRouteProperties is an UNSAFE react-router internal API
      mapRouteProperties: (route: RouteObject) => {
        // Clone the route to avoid mutating the original objects.
        // Without this, re-creating the router would double-wrap loaders,
        // actions, and components — a common cause of blank pages.
        const mapped = { ...route } as ReactRouterRouteObject;

        if (mapped.loader) mapped.loader = wrapLoader(mapped.loader as RRLoader);
        if (mapped.action) mapped.action = wrapAction(mapped.action as RRAction);

        if (route.errorElement) {
          // errorElement is typed as ComponentType in fusion's RouteObject (not ReactNode),
          // so we wrap it into a ReactElement for react-router to consume.
          mapped.errorElement = React.createElement(wrapErrorComponent(route.errorElement));
          mapped.hasErrorBoundary = true;
        } else if (mapped.ErrorBoundary) {
          // Mirror react-router's default mapRouteProperties: convert ErrorBoundary (ComponentType)
          // into errorElement (ReactElement) and set hasErrorBoundary so the router registers it.
          // errorElement and ErrorBoundary are mutually exclusive per React Router docs.
          mapped.errorElement = React.createElement(
            wrapErrorComponent(mapped.ErrorBoundary as ErrorElement),
          );
          (mapped as ReactRouterRouteObject).ErrorBoundary = undefined;
          mapped.hasErrorBoundary = true;
        }
        if (mapped.Component) {
          mapped.Component = wrapComponent(mapped.Component as RouterComponent);
        }

        return mapped;
      },
    });
    // Intentionally excluding fusionRouterContext — it is read via ref so
    // context updates do not destroy and recreate the entire router.
  }, [routes, modules]);

  const [initializedRouter, setInitializedRouter] = useState<ReturnType<
    typeof UNSAFE_createRouter
  > | null>(null);

  useEffect(() => {
    // Initialize and dispose the router inside an effect to avoid side effects
    // during render. This prevents leaked subscriptions in React StrictMode.
    router.initialize();
    setInitializedRouter(router);

    // Dispose previous router instance when the router is recreated or unmounted
    // to clean up history listeners and pending navigations.
    return router.dispose.bind(router);
  }, [router]);

  if (initializedRouter !== router) {
    return loader ?? null;
  }

  return (
    <FusionRouterContextProvider value={fusionRouterContext}>
      <RouterProvider router={router} useTransitions={useTransitions} />
    </FusionRouterContextProvider>
  );
}

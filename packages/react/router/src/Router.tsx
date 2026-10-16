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
  type RouterContext as ReactRouterContext,
} from 'react-router';
import type {
  ActionFunction,
  ErrorElement,
  FusionRouterContext,
  LoaderFunction,
  RouteNode,
  RouteContextProvider,
  RouteObject,
  RouterComponent,
  RouterContext,
} from './types.js';
import type { MiddlewareFunction } from './middleware.js';
import { routerContext } from './router-context.js';
import { routeOperationContext } from './route-operation-context.js';
import { RouteRecoveryScope } from './RouteRecoveryScope.js';
import { routeRecoveryScopeReactContext } from './route-recovery-scope-react-context.js';
import { FusionRouterContextProvider } from './fusion-router-context-provider.js';
import { useRouterContext } from './useRouterContext.js';
import React from 'react';

// React Router's loader/action/component types as used internally.
// v8 also accepts booleans for `loader`/`action`; only functions are wrapped.
type RRLoader = Exclude<NonNullable<ReactRouterRouteObject['loader']>, boolean>;
type RRAction = Exclude<NonNullable<ReactRouterRouteObject['action']>, boolean>;
type RRErrorBoundary = NonNullable<ReactRouterRouteObject['ErrorBoundary']>;
type RRComponent = NonNullable<ReactRouterRouteObject['Component']>;
type RRMiddleware = NonNullable<ReactRouterRouteObject['middleware']>[number];

// ---------------------------------------------------------------------------
// Route property wrappers
//
// Defined at module level so hooks called inside the returned components are
// always at the top of a named function — satisfying the hooks-at-top-level
// rule without suppression comments.
// ---------------------------------------------------------------------------

/**
 * Reads the Fusion router context that `Router` stores in every execution's context provider.
 *
 * @param context - Per-execution React Router context provider.
 * @returns The Fusion modules and custom context for this execution.
 * @throws Error when the provider was not created by the Fusion `Router`, so route handlers and
 *   guards never run without Fusion modules.
 */
function readFusionContext(context: RouteContextProvider): FusionRouterContext {
  const fusion = context.get(routerContext);
  // `Router.getContext` always sets the value; a missing value means the route runs outside it.
  if (!fusion) {
    throw new Error(
      'Fusion router context is not available to route handlers. Render routes through the Fusion <Router> component.',
    );
  }
  return fusion;
}

/** Wraps a route loader to inject the Fusion context as `fusion` in its args. */
function wrapLoader(original: LoaderFunction): RRLoader {
  return function __FusionRouterLoader(args) {
    return original({ ...args, fusion: readFusionContext(args.context) });
  };
}

/** Wraps a route action to inject the Fusion context as `fusion` in its args. */
function wrapAction(original: ActionFunction): RRAction {
  return function __FusionRouterAction(args) {
    return original({ ...args, fusion: readFusionContext(args.context) });
  };
}

/**
 * Functions produced by the Fusion route wrappers.
 *
 * React Router re-runs `mapRouteProperties` on the whole route each time a lazy route property
 * resolves, so wrappers must recognise their own output to avoid wrapping a route twice.
 */
const fusionWrappers = new WeakSet<object>();

/**
 * Wraps a route value once, returning values that were already wrapped unchanged.
 *
 * @template TOriginal - Value type declared on the Fusion route.
 * @template TWrapped - Value type handed to React Router.
 * @param value - Route property value, possibly already produced by a Fusion wrapper.
 * @param wrap - Wrapper that adapts the original value to React Router.
 * @returns The wrapped value, registered so later mappings leave it untouched.
 */
function wrapOnce<TOriginal extends object, TWrapped extends object>(
  value: TOriginal | TWrapped,
  wrap: (original: TOriginal) => TWrapped,
): TWrapped {
  // Lazy property resolution re-maps already wrapped properties; only wrapper output is registered,
  // so membership proves `value` is a TWrapped and anything else is still the declared original.
  if (fusionWrappers.has(value)) return value as TWrapped;
  const wrapped = wrap(value as TOriginal);
  fusionWrappers.add(wrapped);
  return wrapped;
}

/**
 * Adapts a Fusion route middleware to React Router's Data Mode middleware signature.
 *
 * The adapter only injects `signal` and the per-execution Fusion context as `fusion`;
 * ordering, `next()` handling, redirects, error boundaries and cancellation remain the
 * responsibility of React Router's middleware pipeline.
 *
 * @param original - Fusion middleware declared by a route module or route object.
 * @returns A React Router middleware function that calls `original` with Fusion arguments.
 * @throws Error when the router context is missing, so a guard never runs without Fusion modules.
 */
function wrapMiddleware(original: MiddlewareFunction): RRMiddleware {
  return function __FusionRouterMiddleware(args, next) {
    // A guard without Fusion modules cannot decide anything; reading throws before handlers run.
    const fusion = readFusionContext(args.context);
    return original({ ...args, signal: args.request.signal, fusion }, next);
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
 * Router component that integrates React Router v8 with Fusion Framework.
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
 * @returns The rendered router provider, or `null` while it is still initializing
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
    // useModules() returns the generic Modules union; narrow it to the concrete
    // instance type expected by consumers of the router context.
    return {
      context,
      modules: modules as unknown as ModulesInstanceType<Modules>,
    } as FusionRouterContext;
  }, [context, modules]);

  // Store the context in a ref so route loaders/actions always read the
  // latest value without forcing a full router recreation.
  const fusionContextRef = useRef(fusionRouterContext);
  fusionContextRef.current = fusionRouterContext;

  const { router, scope } = useMemo(() => {
    // Narrow the generic modules instance to the shape known to include the navigation module.
    const { navigation } = modules as unknown as ModulesInstanceType<{
      navigation: NavigationModule;
    }>;

    // Assigned right after creation; React Router first calls `getContext` on initialize.
    let scope: RouteRecoveryScope | undefined;
    const instance = UNSAFE_createRouter({
      routes: normalizeRoutes(routes),
      history: navigation.history,
      basename: navigation.basename,
      getContext: () => {
        // Read from ref so the context provider always returns the current value. The operation
        // entry lets role-gate recovery replay exactly the operation of this execution.
        return new RouterContextProvider(
          new Map<ReactRouterContext<unknown>, unknown>([
            [routerContext, fusionContextRef.current],
            [routeOperationContext, scope?.claim() ?? null],
          ]),
        );
      },
      // @ts-expect-error — mapRouteProperties is an UNSAFE react-router internal API
      mapRouteProperties: (route: RouteObject) => {
        // Clone the route to avoid mutating the original objects.
        // Without this, re-creating the router would double-wrap loaders,
        // actions, and components — a common cause of blank pages.
        const mapped = { ...route } as ReactRouterRouteObject;

        // Wrap the loader so fusion module context is available inside it
        if (typeof mapped.loader === 'function') {
          mapped.loader = wrapOnce<LoaderFunction, RRLoader>(mapped.loader, wrapLoader);
        }
        // Wrap the action so fusion module context is available inside it
        if (typeof mapped.action === 'function') {
          mapped.action = wrapOnce<ActionFunction, RRAction>(mapped.action, wrapAction);
        }
        // Only routes that declare middleware get an adapted chain.
        if (route.middleware) {
          // Adapt each middleware so it receives `fusion`; array order is kept because React
          // Router runs a route's middleware in declaration order.
          mapped.middleware = route.middleware.map((middleware) =>
            wrapOnce<MiddlewareFunction, RRMiddleware>(middleware, wrapMiddleware),
          );
        }

        // Prefer an explicit errorElement over ErrorBoundary when both are somehow present.
        // A React element means this route was already mapped before a lazy property resolved.
        if (route.errorElement && !React.isValidElement(route.errorElement)) {
          // errorElement is typed as ComponentType in fusion's RouteObject (not ReactNode),
          // so we wrap it into a ReactElement for react-router to consume.
          mapped.errorElement = React.createElement(wrapErrorComponent(route.errorElement));
        } else if (mapped.ErrorBoundary) {
          // Mirror react-router's default mapRouteProperties: convert ErrorBoundary (ComponentType)
          // into errorElement (ReactElement). React Router v8 removed `hasErrorBoundary` and
          // detects boundaries from the presence of `errorElement`/`ErrorBoundary`.
          // errorElement and ErrorBoundary are mutually exclusive per React Router docs.
          mapped.errorElement = React.createElement(
            wrapErrorComponent(mapped.ErrorBoundary as ErrorElement),
          );
          (mapped as ReactRouterRouteObject).ErrorBoundary = undefined;
        }
        // Wrap the Component so fusion module context is available inside it
        if (mapped.Component) {
          mapped.Component = wrapOnce<RouterComponent, RRComponent>(
            mapped.Component as RouterComponent,
            wrapComponent,
          );
        }

        return mapped;
      },
    });
    // Wrap before render: data hooks read `navigate` and `fetch` from the router instance.
    scope = new RouteRecoveryScope(instance);
    return { router: instance, scope };
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
    scope.setActive(true);
    setInitializedRouter(router);

    // Dispose previous router instance when the router is recreated or unmounted
    // to clean up history listeners and pending navigations. Deactivating the scope first
    // makes pending role-gate recoveries of this instance refuse to replay and dismisses held
    // fetcher executions before their requests are aborted.
    return () => {
      scope.setActive(false);
      router.dispose();
    };
  }, [router, scope]);

  // Defer rendering children until the router instance has finished initializing
  if (initializedRouter !== router) {
    return loader ?? null;
  }

  return (
    <FusionRouterContextProvider value={fusionRouterContext}>
      {/* Lets fetcher-recovery hosts register with this router instance only. */}
      <routeRecoveryScopeReactContext.Provider value={scope}>
        <RouterProvider router={router} useTransitions={useTransitions} />
      </routeRecoveryScopeReactContext.Provider>
    </FusionRouterContextProvider>
  );
}

import React from 'react';
import { useActionData, useLoaderData, useRouteError } from 'react-router';
import type {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  FusionRouterContext,
  RouteObject,
  RouterSchema,
} from '../types.js';

type UnsupportedLazyRouteObjectKey =
  | 'lazy'
  | 'caseSensitive'
  | 'path'
  | 'id'
  | 'index'
  | 'children';

/**
 * Route object returned by the lazy loader function.
 * Excludes properties that are handled by React Router internally.
 */
export type LazyLoaderObject = Omit<RouteObject, UnsupportedLazyRouteObjectKey> & {
  meta?: RouterSchema;
};

/**
 * Options for creating a lazy loader for a route.
 */
export type LazyLoaderOptions = {
  /** Optional React element to display while the route module is loading */
  loader?: React.ReactElement;
  /** Initial route object properties to merge with the loaded module */
  initial?: LazyLoaderObject;
  /** Fusion Framework context to inject into loaders, actions, and components */
  context?: FusionRouterContext;
};

/**
 * Creates a component that renders the HydrateFallback from the module once it loads.
 * Falls back to a default loading element if the module doesn't export HydrateFallback.
 * 
 * @param HydrateFallbackResolver - Promise resolving to the HydrateFallback component or null
 * @param options - Options containing optional loader element
 * @returns React element that displays the fallback component
 */
const createHydrateFallbackComponent = (
  HydrateFallbackResolver: Promise<React.ComponentType | null>,
  options?: { loader?: React.ReactElement },
): React.ReactElement => {
  return React.createElement(() => {
    const [FallbackComponent, setFallbackComponent] = React.useState<React.ReactElement | null>(
      options?.loader ?? null,
    );
    React.useEffect(() => {
      HydrateFallbackResolver.then((component) => {
        if (component) {
          setFallbackComponent(React.createElement(component));
        }
      });
    }, [HydrateFallbackResolver]);

    return FallbackComponent;
  });
};

/**
 * Creates a lazy-loaded route object from a file path.
 * 
 * This function creates a React Router RouteObject that:
 * - Lazy loads the route module for code splitting
 * - Injects Fusion Framework context into loaders, actions, and components
 * - Extracts and wraps exported functions (clientLoader, action, default component, ErrorElement, HydrateFallback)
 * - Merges route schema/handle from the module with any route-level overrides
 * - Provides a hydrate fallback element for React Router v7 SSR support
 * 
 * The module file can export:
 * - `default` - The route component (receives loaderData, actionData, and fusion as props)
 * - `clientLoader` - Loader function (receives fusion context)
 * - `action` - Action function (receives fusion context)
 * - `ErrorElement` - Error boundary component (receives error and fusion as props)
 * - `HydrateFallback` - Component to show during SSR hydration
 * - `handle` - Route metadata (RouterHandle or RouterSchema format)
 * 
 * @param filePath - Path to the route module file (can be file:// URL or regular path)
 * @param options - Options for lazy loading including loader element, initial properties, and Fusion context
 * @returns RouteObject with lazy loading configured
 * 
 * @example
 * ```typescript
 * // pages/product.tsx
 * export async function clientLoader({ params, fusion }) {
 *   const client = fusion.modules.http.createHttpClient('products');
 *   return client.json(`/products/${params.productId}`);
 * }
 * 
 * export default function Product({ loaderData, fusion }) {
 *   return <div>{loaderData.name}</div>;
 * }
 * 
 * // routes.ts
 * const route = createLazyLoader('./pages/product.tsx', {
 *   context: fusionRouterContext,
 *   loader: <LoadingSpinner />
 * });
 * ```
 */
export const createLazyLoader = (filePath: string, options?: LazyLoaderOptions): RouteObject => {
  // Pre-load the module to extract HydrateFallback synchronously if possible
  // This allows React Router v7 to have access to HydrateFallback during initial hydration
  const modulePromise = import(/* @vite-ignore */ filePath);

  const hydrateFallbackElement: RouteObject['hydrateFallbackElement'] =
    createHydrateFallbackComponent(
      modulePromise.then((module) => module.HydrateFallback ?? null),
      options,
    );

  const lazy = async (): Promise<LazyLoaderObject> => {
    const module = await modulePromise;
    const { context: fusion, initial: result = {} } = options ?? {};

    // Extract loader if present and wrap it to inject fusion from context
    const hasLoader = module.clientLoader && typeof module.clientLoader === 'function';
    if (hasLoader) {
      const originalLoader = module.clientLoader as LoaderFunction;
      result.loader = (args) => {
        const props = Object.assign({}, args, { fusion }) as unknown as LoaderFunctionArgs;
        return originalLoader(props);
      };
    }

    // Extract action if present and wrap it to inject fusion from context
    const hasAction = module.action && typeof module.action === 'function';
    if (hasAction) {
      const originalAction = module.action as ActionFunction;
      result.action = function FusionRouterAction(args) {
        const props = Object.assign({}, args, { fusion }) as unknown as ActionFunctionArgs;
        return originalAction(props);
      };
    }

    if (module.default) {
      const OriginalComponent = module.default;
      result.Component = function FusionRouterComponent(args) {
        const loaderData = useLoaderData();
        const actionData = useActionData();
        const props = Object.assign({}, args, { fusion, loaderData, actionData });
        return React.createElement(OriginalComponent, props);
      } as React.ComponentType;
    }

    // Extract HydrateFallback if present
    // This is returned from the lazy loader and used by React Router v7
    if (module.HydrateFallback && typeof module.HydrateFallback === 'function') {
      result.HydrateFallback = () =>
        React.createElement(module.HydrateFallback as React.ComponentType<unknown>);
    }

    // Extract errorElement if present and wrap it to inject error and routerContext as props
    if (module.ErrorElement && typeof module.ErrorElement === 'function') {
      const OriginalErrorElement = module.ErrorElement;
      result.errorElement = React.createElement(function FusionRouterErrorElement() {
        const error = useRouteError();
        const props = Object.assign({}, { fusion, error });
        return React.createElement(OriginalErrorElement, props);
      });
      result.hasErrorBoundary ??= true;
    }
    // Initialize handle if it doesn't exist
    result.handle ??= { route: {} };
    
    // Ensure handle.route exists
    if (!result.handle.route) {
      result.handle.route = {};
    }
    
    if(module.handle && typeof module.handle === 'object') {
      // Module can export handle as RouterHandle (with route property) or RouterSchema
      if ('route' in module.handle && typeof module.handle.route === 'object') {
        // Module exports handle as RouterHandle - merge route property
        const moduleHandle = module.handle as { route: RouterSchema; [key: string]: unknown };
        result.handle.route = {
          description: result.handle.route.description ?? moduleHandle.route.description,
          params: {
            ...moduleHandle.route.params,
            ...result.handle.route.params,
          },
          search: {
            ...moduleHandle.route.search,
            ...result.handle.route.search,
          },
        };
        // Preserve any other properties from module handle (excluding route)
        Object.keys(moduleHandle).forEach(key => {
          if (key !== 'route') {
            result.handle[key] = moduleHandle[key];
          }
        });
      } else {
        // Module exports handle as RouterSchema (legacy) - wrap it in route property
        const moduleSchema = module.handle as RouterSchema;
        result.handle.route = {
          description: result.handle.route.description ?? moduleSchema.description,
          params: {
            ...moduleSchema.params,
            ...result.handle.route.params,
          },
          search: {
            ...moduleSchema.search,
            ...result.handle.route.search,
          },
        };
      }
    }

    return result;
  };

  return { lazy, hydrateFallbackElement } as RouteObject;
};

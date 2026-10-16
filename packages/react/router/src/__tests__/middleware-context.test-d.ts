import { describe, expectTypeOf, it } from 'vitest';
import type {
  ActionFunctionArgs as ReactRouterActionFunctionArgs,
  LoaderFunction as ReactRouterLoaderFunction,
  LoaderFunctionArgs as ReactRouterLoaderFunctionArgs,
  MiddlewareFunction as ReactRouterMiddlewareFunction,
  RouterContextProvider as ReactRouterContextProvider,
} from 'react-router';

import type {
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  MiddlewareFunctionArgs,
  RouteContextProvider,
  RouteObject,
} from '../index.js';
import {
  projectAction,
  projectLoader,
  resolveViewer,
  viewerContext,
  type Viewer,
} from './mocks/middleware/context-pipeline.js';

/** Type-only provider; the assertions are compiled, never executed. */
declare const context: RouteContextProvider;

describe('route context typing', () => {
  it('exposes React Router v8 provider type to middleware, loaders and actions', () => {
    expectTypeOf<RouteContextProvider>().toEqualTypeOf<Readonly<ReactRouterContextProvider>>();
    expectTypeOf<MiddlewareFunctionArgs['context']>().toEqualTypeOf<RouteContextProvider>();
    expectTypeOf<LoaderFunctionArgs['context']>().toEqualTypeOf<RouteContextProvider>();
    expectTypeOf<ActionFunctionArgs['context']>().toEqualTypeOf<RouteContextProvider>();
    // Same type upstream hands to its own middleware, loaders and actions.
    expectTypeOf<
      Parameters<ReactRouterMiddlewareFunction>[0]['context']
    >().toEqualTypeOf<RouteContextProvider>();
    expectTypeOf<ReactRouterLoaderFunctionArgs['context']>().toEqualTypeOf<RouteContextProvider>();
    expectTypeOf<ReactRouterActionFunctionArgs['context']>().toEqualTypeOf<RouteContextProvider>();
  });

  it('reads values set by middleware with their declared type', () => {
    expectTypeOf(context.get(viewerContext)).toEqualTypeOf<Viewer>();
    context.set(viewerContext, { name: 'alice', canWrite: true });
    // @ts-expect-error a value must match the type declared by its context key
    context.set(viewerContext, { name: 1, canWrite: true });
  });

  it('accepts typed Fusion and upstream handlers on route objects', () => {
    expectTypeOf(resolveViewer).toExtend<NonNullable<RouteObject['middleware']>[number]>();
    expectTypeOf(projectLoader).toExtend<NonNullable<RouteObject['loader']>>();
    expectTypeOf(projectAction).toExtend<NonNullable<RouteObject['action']>>();
    // Loaders typed with React Router's own types keep working on Fusion routes.
    expectTypeOf<ReactRouterLoaderFunction>().toExtend<LoaderFunction>();
    expectTypeOf<ReactRouterLoaderFunction>().toExtend<NonNullable<RouteObject['loader']>>();
  });

  it('keeps url, pattern and params on handler arguments', () => {
    expectTypeOf<LoaderFunctionArgs['url']>().toEqualTypeOf<URL>();
    expectTypeOf<LoaderFunctionArgs['pattern']>().toEqualTypeOf<string>();
    expectTypeOf<LoaderFunctionArgs<{ id?: string }>['params']>().toEqualTypeOf<{ id?: string }>();
  });
});

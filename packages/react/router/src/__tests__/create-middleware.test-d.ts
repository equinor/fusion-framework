import { describe, expectTypeOf, it } from 'vitest';
import {
  createMiddleware,
  type FusionRouterContext,
  type MiddlewareFunction,
  type MiddlewareFunctionArgs,
  type MiddlewareNextFunction,
  type RouteObject,
} from '../index.js';

describe('createMiddleware typing', () => {
  it('infers the canonical router arguments and continuation', () => {
    const middleware = createMiddleware(async (args, next) => {
      expectTypeOf(args).toEqualTypeOf<MiddlewareFunctionArgs>();
      expectTypeOf(next).toEqualTypeOf<MiddlewareNextFunction>();
      expectTypeOf(args.request).toEqualTypeOf<Request>();
      expectTypeOf(args.signal).toEqualTypeOf<AbortSignal>();
      return next();
    });
    expectTypeOf(middleware).toExtend<MiddlewareFunction>();
    expectTypeOf(middleware).toExtend<NonNullable<RouteObject['middleware']>[number]>();
  });

  it('supports typed route parameters, application context and downstream results', () => {
    const middleware = createMiddleware<
      { projectId?: string },
      FusionRouterContext<{ activeProject: string }>,
      string
    >(async ({ params, fusion }, next) => {
      expectTypeOf(params.projectId).toEqualTypeOf<string | undefined>();
      expectTypeOf(fusion.context.activeProject).toEqualTypeOf<string>();
      expectTypeOf(next).toEqualTypeOf<MiddlewareNextFunction<string>>();
      return next();
    });
    expectTypeOf(middleware).toEqualTypeOf<
      MiddlewareFunction<
        { projectId?: string },
        FusionRouterContext<{ activeProject: string }>,
        string
      >
    >();
  });

  it('rejects invalid arguments and callbacks', () => {
    createMiddleware(({ request }) => {
      // @ts-expect-error request is the platform Request, not an untyped object
      request.notARequestProperty;
    });
    // @ts-expect-error middleware definitions must be callable
    createMiddleware(123);
    // @ts-expect-error middleware receives a Request, not a numeric request
    createMiddleware((_args: { request: number }) => undefined);
  });
});

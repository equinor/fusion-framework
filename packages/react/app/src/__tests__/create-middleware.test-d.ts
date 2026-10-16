import { describe, expectTypeOf, it } from 'vitest';
import type {
  createMiddleware as routerCreateMiddleware,
  MiddlewareFunction,
  RouteObject,
} from '@equinor/fusion-framework-react-router';
import { createMiddleware } from '../routing/index.js';
import { requireRoles } from '../roles/index.js';

/** Type-only arguments for verifying the reusable guard's downstream inference. */
declare const roleArgs: Parameters<ReturnType<typeof requireRoles>>[0];

describe('middleware integration typing', () => {
  it('re-exports the router-owned factory through the app routing entry point', () => {
    expectTypeOf(createMiddleware).toEqualTypeOf<typeof routerCreateMiddleware>();
  });

  it('preserves reusable role guards and their generic downstream result', () => {
    const guard = requireRoles(['Reports.Read']);
    const middleware = createMiddleware(guard);
    expectTypeOf(middleware).toEqualTypeOf<typeof guard>();
    expectTypeOf(middleware).toExtend<MiddlewareFunction>();
    expectTypeOf(middleware).toExtend<NonNullable<RouteObject['middleware']>[number]>();
    expectTypeOf(middleware(roleArgs, () => 'allowed')).toEqualTypeOf<Promise<string>>();
  });
});

import type { ReactElement } from 'react';
import {
  createMiddleware,
  Outlet,
  redirect,
  type ErrorElementProps,
} from '@equinor/fusion-framework-react-router';
import { demoContext } from '../demo-context';

export const middleware = [
  createMiddleware(async ({ context, signal }, next) => {
    const execution = { events: ['layout:before'], viewer: 'Demo reader' };
    context.set(demoContext, execution);
    // Logging in finally makes denied and failed executions visible as well.
    try {
      signal.throwIfAborted();
      return await next();
    } finally {
      execution.events.push('layout:after');
      console.info('routing-demo', [...execution.events]);
    }
  }),
  createMiddleware(async ({ context, url }, next) => {
    const execution = context.get(demoContext);
    execution.events.push('guard');
    // Query state makes the example reproducible; it is never real authorization.
    if (url.searchParams.get('access') === 'error') {
      throw new Error('Demo access service unavailable');
    }
    // Denial redirects outside the guarded subtree to avoid redirect loops.
    if (url.searchParams.get('access') !== 'allow') {
      throw redirect('/middleware?denied=1');
    }
    return next();
  }),
];

/**
 * Keeps the demo guard on a shared parent of explicit report routes.
 * @returns The matched report page.
 */
export default function MiddlewareLayout(): ReactElement {
  return <Outlet />;
}

/**
 * Surfaces access-check failures without pretending they mean missing permission.
 * @param props - The error from the shared middleware.
 * @returns An explicit error view.
 */
export function ErrorElement({ error }: ErrorElementProps): ReactElement {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <section>
      <h2>Middleware failed</h2>
      <p>{message}</p>
    </section>
  );
}

import {
  Outlet,
  type ErrorElementProps,
  type MiddlewareFunction,
} from '@equinor/fusion-framework-react-router';

import { middlewareLog } from './middleware-log.js';

/**
 * Wraps the downstream chain to record the layout's before and after phases.
 *
 * @param _args - Middleware arguments, unused by this fixture.
 * @param next - Runs the downstream middleware and handlers.
 * @returns The downstream result, unchanged.
 */
const layoutTiming: MiddlewareFunction = async (_args, next) => {
  middlewareLog.push('layout:before');
  const result = await next();
  middlewareLog.push('layout:after');
  return result;
};

export const middleware = [layoutTiming];

/**
 * Renders the error that stopped the layout's middleware chain.
 *
 * @param props - Route error props injected by the Fusion router.
 * @returns The error message.
 */
export function ErrorElement({ error }: ErrorElementProps): React.ReactElement {
  return <p>layout-error:{error instanceof Error ? error.message : String(error)}</p>;
}

/**
 * Pathless layout fixture that renders the matched child route.
 *
 * @returns The child route outlet.
 */
export default function GuardedLayout(): React.ReactElement {
  return <Outlet />;
}

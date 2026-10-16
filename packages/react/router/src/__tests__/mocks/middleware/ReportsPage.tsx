import type {
  LoaderFunctionArgs,
  MiddlewareFunction,
  RouteComponentProps,
} from '@equinor/fusion-framework-react-router';

import { middlewareLog } from './middleware-log.js';

/**
 * Denies the reports route when the request carries `?deny`, otherwise wraps the loader.
 *
 * @param args - Middleware arguments with the navigation request.
 * @param next - Runs the downstream handlers.
 * @returns The downstream result, unchanged.
 * @throws Error when the request asks to be denied.
 */
const reportsGuard: MiddlewareFunction = async ({ request }, next) => {
  middlewareLog.push('reports:before');
  // The fixture decides from the URL so tests control the guard without shared state.
  if (new URL(request.url).searchParams.has('deny')) {
    throw new Error('reports denied');
  }
  const result = await next();
  middlewareLog.push('reports:after');
  return result;
};

export const middleware = [reportsGuard];

/**
 * Protected loader that must only run after the middleware chain allowed it.
 *
 * @param args - Loader arguments with the matched params.
 * @returns The loaded report label.
 */
export function clientLoader(_args: LoaderFunctionArgs): string {
  middlewareLog.push('reports:loader');
  return 'reports-data';
}

/**
 * Renders the protected reports page.
 *
 * @param props - Route props with loader data.
 * @returns The loaded report label.
 */
export default function ReportsPage({
  loaderData,
}: RouteComponentProps<string>): React.ReactElement {
  return <p>{loaderData}</p>;
}

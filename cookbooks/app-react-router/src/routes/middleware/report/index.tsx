import type { ReactElement } from 'react';
import {
  createMiddleware,
  Link,
  type LoaderFunctionArgs,
  type RouteComponentProps,
} from '@equinor/fusion-framework-react-router';
import { demoContext } from '../demo-context';

export const handle = {
  route: {
    description: 'Protected middleware demonstration report',
    params: { id: 'Report identifier' },
    search: { access: 'Demo only: allow, deny or error; not authorization' },
  },
};

export const middleware = [
  createMiddleware(async ({ context }, next) => {
    const execution = context.get(demoContext);
    execution.events.push('report:before');
    const result = await next();
    execution.events.push('report:after');
    return result;
  }),
];

/**
 * Reads typed parent context only after the shared guard permits downstream work.
 * @param args - Matched report parameters and middleware execution context.
 * @returns The report label and demo viewer.
 */
export function clientLoader({ context, params }: LoaderFunctionArgs<{ id: string }>): {
  id: string;
  viewer: string;
} {
  const execution = context.get(demoContext);
  execution.events.push('report:loader');
  return { id: params.id, viewer: execution.viewer };
}

/**
 * Shows protected loader data and links to another child of the same guard.
 * @param props - Data returned by the protected loader.
 * @returns A report and a child-to-child navigation link.
 */
export default function Report({
  loaderData,
}: RouteComponentProps<{ id: string; viewer: string }>): ReactElement {
  return (
    <section>
      <h2>Demo report {loaderData.id}</h2>
      <p>Viewer from middleware: {loaderData.viewer}</p>
      <Link to="/middleware/reports/next?access=allow">Next report</Link>
    </section>
  );
}

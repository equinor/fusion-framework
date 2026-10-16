import { requireRoles, type RouteComponentProps } from '@equinor/fusion-framework-react-router';

import { rolesLog } from './roles-log.js';

export const middleware = [requireRoles(['Reports.Read', 'Reports.Admin'], { mode: 'any' })];

/**
 * Protected loader that must only run after both role gates allowed it.
 *
 * @returns The loaded report label.
 */
export function clientLoader(): string {
  rolesLog.push('reports:loader');
  return 'reports-data';
}

/**
 * Renders the protected reports page.
 *
 * @param props - Route props with loader data.
 * @returns The loaded report label.
 */
export default function RolesReportsPage({
  loaderData,
}: RouteComponentProps<string>): React.ReactElement {
  return <p>{loaderData}</p>;
}

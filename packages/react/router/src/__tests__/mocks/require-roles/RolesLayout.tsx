import {
  Outlet,
  requireRoles,
  type ErrorElementProps,
} from '@equinor/fusion-framework-react-router';

export const middleware = [requireRoles(['App.Access'])];

/**
 * Renders the error that stopped the role-gated chain.
 *
 * @param props - Route error props injected by the Fusion router.
 * @returns The error message.
 */
export function ErrorElement({ error }: ErrorElementProps): React.ReactElement {
  return <p>roles-error:{error instanceof Error ? error.message : String(error)}</p>;
}

/**
 * Role-gated pathless layout fixture.
 *
 * @returns The child route outlet.
 */
export default function RolesLayout(): React.ReactElement {
  return <Outlet />;
}

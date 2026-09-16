import type { ReactNode } from 'react';

import { ErrorBoundary, type FallbackProps } from '@equinor/fusion-react-errorboundary';
import type { RolesModule } from '@equinor/fusion-framework-module-roles';
import { useModule } from '@equinor/fusion-framework-react-module';

import { findRequiredAccessRolesError } from './find-required-access-roles-error';
import { getRequiredAccessRolesKey } from './get-required-access-roles-key';
import { AccessRoleGate } from './AccessRoleGate';
import { RoleErrorView } from './RoleErrorView';
import { toAccessRoleError } from './to-access-role-error';

/**
 * Props for guarding a React subtree with required Roles V2 access-role names.
 */
export interface AccessRoleBoundaryProps {
  /** Access-role names that must all be active before children render. */
  readonly requiredAccessRoles?: readonly string[];
  /** React subtree rendered after every required access role is active. */
  readonly children: ReactNode;
}

/**
 * Guards a React subtree with required Roles V2 access roles and renders recovery when needed.
 *
 * Errors unrelated to access roles are rethrown so an outer application error boundary can
 * retain ownership of unrelated failures.
 *
 * @param props - Required access-role names and protected children.
 * @returns An access-role-aware error boundary around the protected subtree.
 *
 * @example
 * ```tsx
 * <AccessRoleBoundary requiredAccessRoles={['Reports.Read']}>
 *   <Reports />
 * </AccessRoleBoundary>
 * ```
 */
export const AccessRoleBoundary = ({
  requiredAccessRoles,
  children,
}: AccessRoleBoundaryProps): ReactNode => {
  // The gate is unmounted while recovery is shown; the boundary must still observe scope changes
  // so it cannot keep offering claims through the previous provider after account replacement.
  const roles = useModule<RolesModule>('roles');
  const requiredKey = getRequiredAccessRolesKey(requiredAccessRoles ?? []);
  const hasRequirements = requiredAccessRoles !== undefined && requiredKey !== '[]';

  /**
   * Renders recovery only for the required-access-role failures this boundary owns.
   * @param props - Caught error and boundary reset callback.
   * @returns Required-access-role recovery UI.
   * @throws Unrelated errors for the outer application boundary.
   */
  const renderFallback = ({ error, resetErrorBoundary }: FallbackProps): ReactNode => {
    const accessRoleError = toAccessRoleError(error);
    // Preserve catch-all ownership in the nearest outer application boundary.
    if (!findRequiredAccessRolesError(accessRoleError)) {
      throw accessRoleError;
    }
    return <RoleErrorView error={accessRoleError} onRetry={resetErrorBoundary} />;
  };

  return (
    <ErrorBoundary resetKeys={[requiredKey, roles]} fallbackRender={renderFallback}>
      {hasRequirements ? (
        <AccessRoleGate requiredAccessRoles={requiredAccessRoles}>{children}</AccessRoleGate>
      ) : (
        children
      )}
    </ErrorBoundary>
  );
};

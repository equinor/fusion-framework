import type { ReactNode } from 'react';

import { ErrorBoundary, type FallbackProps } from '@equinor/fusion-react-errorboundary';
import type { RolesModule } from '@equinor/fusion-framework-module-roles';
import { useModule } from '@equinor/fusion-framework-react-module';

import { findRequiredRolesError } from './find-required-roles-error';
import { getRequiredRolesKey } from './get-required-roles-key';
import { RequiredRoleGate } from './RequiredRoleGate';
import { RoleErrorView } from './RoleErrorView';
import { toRoleError } from './to-role-error';

/**
 * Props for guarding a React subtree with required Roles V2 access.
 */
export interface RoleBoundaryProps {
  /** Access-role names that must all be active before children render. */
  readonly required?: readonly string[];
  /** React subtree rendered after every required role is active. */
  readonly children: ReactNode;
}

/**
 * Guards a React subtree with required Roles V2 access and renders role recovery when needed.
 *
 * Non-role errors are rethrown so an outer application error boundary can retain ownership of
 * unrelated failures.
 *
 * @param props - Required roles and protected children.
 * @returns A role-aware error boundary around the protected subtree.
 *
 * @example
 * ```tsx
 * <RoleBoundary required={['Reports.Read']}>
 *   <Reports />
 * </RoleBoundary>
 * ```
 */
export const RoleBoundary = ({ required, children }: RoleBoundaryProps): ReactNode => {
  // The gate is unmounted while recovery is shown; the boundary must still observe scope changes
  // so it cannot keep offering claims through the previous provider after account replacement.
  const roles = useModule<RolesModule>('roles');
  const requiredKey = getRequiredRolesKey(required ?? []);
  const hasRequirements = required !== undefined && requiredKey !== '[]';

  /**
   * Renders recovery only for the role failures this boundary owns.
   * @param props - Caught error and boundary reset callback.
   * @returns Required-role recovery UI.
   * @throws Unrelated errors for the outer application boundary.
   */
  const renderFallback = ({ error, resetErrorBoundary }: FallbackProps): ReactNode => {
    const roleError = toRoleError(error);
    // Preserve catch-all ownership in the nearest outer application boundary.
    if (!findRequiredRolesError(roleError)) {
      throw roleError;
    }
    return <RoleErrorView error={roleError} onRetry={resetErrorBoundary} />;
  };

  return (
    <ErrorBoundary resetKeys={[requiredKey, roles]} fallbackRender={renderFallback}>
      {hasRequirements ? (
        <RequiredRoleGate required={required}>{children}</RequiredRoleGate>
      ) : (
        children
      )}
    </ErrorBoundary>
  );
};

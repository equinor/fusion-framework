import { useEffect, useState, type ReactNode } from 'react';
import type { RolesModule } from '@equinor/fusion-framework-module-roles';
import { useModule } from '@equinor/fusion-framework-react-module';
import { CheckingRolesView } from './CheckingRolesView';
import { getRequiredAccessRolesKey } from './get-required-access-roles-key';
import { toAccessRoleError } from './to-access-role-error';

/** Access-role requirements and the subtree whose mounting must be gated. */
interface AccessRoleGateProps {
  readonly requiredAccessRoles: readonly string[];
  readonly children: ReactNode;
}

/**
 * Resolves required access roles before mounting protected children or their effects.
 * @param props - Required access-role names and protected children.
 * @returns Loading state or protected children after the access-role check succeeds.
 * @throws Failed access-role checks during render so AccessRoleBoundary can own recovery.
 */
export const AccessRoleGate = ({
  requiredAccessRoles,
  children,
}: AccessRoleGateProps): ReactNode => {
  const roles = useModule<RolesModule>('roles');
  const requiredKey = getRequiredAccessRolesKey(requiredAccessRoles);
  const [result, setResult] = useState<{
    readonly requiredKey: string;
    readonly roles: typeof roles;
    readonly error?: Error;
  }>();

  // The semantic key covers requiredAccessRoles; equivalent inline arrays must not restart the check.
  // biome-ignore lint/correctness/useExhaustiveDependencies: requiredKey captures provider-normalized requirement identity.
  useEffect(() => {
    let active = true;
    setResult(undefined);
    // Injectable providers can throw before returning a promise; route both failure forms
    // through render so the boundary, rather than an uncaught effect, owns recovery.
    void Promise.resolve()
      .then(() => roles.hasAccessRole(requiredAccessRoles, { required: true, assert: true }))
      .then(() => {
        // A replaced requirement must not reveal children from an obsolete access check.
        if (active) {
          setResult({ requiredKey, roles });
        }
      })
      .catch((cause: unknown) => {
        // Throw during render so the surrounding React error boundary can own recovery.
        if (active) {
          setResult({ requiredKey, roles, error: toAccessRoleError(cause) });
        }
      });
    return () => {
      active = false;
    };
  }, [requiredKey, roles]);

  // Effect cleanup/reset happens after commit. Bind access to the checked inputs during render
  // so replacing requirements or the module provider cannot mount unchecked child effects.
  if (!result || result.requiredKey !== requiredKey || result.roles !== roles) {
    return <CheckingRolesView />;
  }
  // React error boundaries catch render failures, not rejected effect promises.
  if (result.error) {
    throw result.error;
  }
  return children;
};

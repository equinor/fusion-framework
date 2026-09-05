import { useState, type ReactNode } from 'react';
import type { RolesModule } from '@equinor/fusion-framework-module-roles';
import { useModule } from '@equinor/fusion-framework-react-module';
import { RolesProviderScope } from './RolesProviderScope';

/** Props for sharing Roles V2 collections and activation state. */
export interface RolesProviderProps {
  /** Access-role names that must all be active before children render. */
  readonly required?: readonly string[];
  /** Application subtree that consumes roles hooks. */
  readonly children: ReactNode;
}

/**
 * Provides active and claimable Roles V2 state to application components.
 * Replacing the module provider resets collections, recovery history, and the consuming subtree.
 * @param props - Optional required roles and the application subtree.
 * @returns State scoped to the configured Roles module provider.
 * @throws When the Roles module is missing or lacks the collection and mutation contract.
 * @example
 * ```tsx
 * <RolesProvider required={['Reports.Read']}>
 *   <Application />
 * </RolesProvider>
 * ```
 */
export const RolesProvider = ({ required, children }: RolesProviderProps): ReactNode => {
  const provider = useModule<RolesModule>('roles');
  const [scope, setScope] = useState({ provider, generation: 0 });

  // useModule performs a typed lookup, not runtime validation. Fail before constructing a store
  // so missing configuration cannot leave consumers behind an indefinite loading indicator.
  if (
    !provider ||
    typeof provider.getActiveRoles !== 'function' ||
    typeof provider.getClaimableRoles !== 'function' ||
    typeof provider.claimRole !== 'function' ||
    typeof provider.deactivateRole !== 'function' ||
    typeof provider.hasRole !== 'function'
  ) {
    throw new Error(
      'RolesProvider requires a configured Roles module. Call enableRoles in the Fusion module configuration and mount inside its module context.',
    );
  }
  // Reset during render, not in an effect: the previous account's roles and dialogs must never
  // commit under a different provider, even for one render.
  if (scope.provider !== provider) {
    setScope({ provider, generation: scope.generation + 1 });
    return null;
  }
  return (
    <RolesProviderScope key={scope.generation} provider={provider} required={required}>
      {children}
    </RolesProviderScope>
  );
};

import { useMemo, useState } from 'react';
import type { RequiredRoleClaim } from '@equinor/fusion-framework-module-roles';

import { useClaimableRoles, type UseClaimableRolesResult } from '../../hooks/useClaimableRoles';
import { useRoles, type UseRolesResult } from '../../hooks/useRoles';
import { createClaimableRoles } from './create-claimable-roles';
import type { ClaimableRoleDetails } from './role-details';

/** Shared collection and activation controller for the two role browsing layouts. */
interface RolesOverview {
  readonly active: UseRolesResult;
  readonly claimable: UseClaimableRolesResult;
  readonly claimableRoles: readonly ClaimableRoleDetails[];
  readonly selectedClaim?: RequiredRoleClaim;
  readonly selectClaim: (claim: RequiredRoleClaim | undefined) => void;
  readonly claimRole: (roleId: string, reason: string, hours: number) => Promise<void>;
  readonly deactivateRole: (assignmentId: string) => Promise<void>;
  readonly reload: () => Promise<void>;
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly loadError: unknown;
}

/**
 * Coordinates shared role collections and dialog selection without owning a presentation layout.
 * @returns Provider state, normalized claimable roles, and audited mutation callbacks.
 */
export const useRolesOverview = (): RolesOverview => {
  const active = useRoles();
  const claimable = useClaimableRoles();
  const [selectedClaim, selectClaim] = useState<RequiredRoleClaim>();
  const [hasSettled, setHasSettled] = useState(false);
  const claimableRoles = useMemo(() => createClaimableRoles(claimable.roles), [claimable.roles]);
  const isLoading = active.isLoading || claimable.isLoading;
  // Once first reads settle, even an empty account is a usable view. Never unmount audit forms
  // for subsequent refreshes; collection errors instead explain that the retained snapshot is stale.
  if (!hasSettled && !isLoading) {
    setHasSettled(true);
  }

  /**
   * Closes selection after activation succeeds and its collection refreshes settle.
   * @param roleId - Selected assignment identifier.
   * @param reason - User-provided audit reason.
   * @param hours - Requested activation duration.
   * @returns Completion of the provider-backed activation.
   * @throws Provider failures for the claim dialog to display.
   */
  const claimRole = async (roleId: string, reason: string, hours: number): Promise<void> => {
    await claimable.claimRole({ roleId, reason, hours });
    selectClaim(undefined);
  };

  /**
   * Ends an activation without changing the account's claimable entitlement.
   * @param assignmentId - Assignment to deactivate.
   * @returns Completion of the provider-backed deactivation.
   */
  const deactivateRole = async (assignmentId: string): Promise<void> => {
    await claimable.deactivateRole({ roleId: assignmentId });
  };

  /**
   * Reloads both collections so neither tab keeps an outdated account snapshot.
   * @returns Completion of both collection requests.
   */
  const reload = async (): Promise<void> => {
    await Promise.all([active.reload(), claimable.reload()]);
  };

  return {
    active,
    claimable,
    claimableRoles,
    selectedClaim,
    selectClaim,
    claimRole,
    deactivateRole,
    reload,
    isLoading: isLoading && !hasSettled,
    isRefreshing: isLoading && hasSettled,
    loadError: active.error ?? claimable.error,
  };
};

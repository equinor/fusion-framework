import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import type {
  ClaimRoleInput,
  DeactivateRoleInput,
  IRolesProvider,
} from '@equinor/fusion-framework-module-roles';

import { RoleBoundary } from '../components/required-access/RoleBoundary';
import { RoleClaimDialog } from '../components/claim/RoleClaimDialog';
import { RolesStore } from '../state/RolesStore';
import type { RoleClaimResult, RoleDeactivateResult } from '../state/roles-state';
import { RolesContext, type RolesContextValue } from './roles-context';
import type { RolesProviderProps } from './RolesProvider';
import { useExpiredRoleRecovery } from './useExpiredRoleRecovery';

const ROLE_REFRESH_INTERVAL_MS = 60_000;

/** The validated module provider defining this state lifetime. */
interface RolesProviderScopeProps extends RolesProviderProps {
  readonly provider: IRolesProvider;
}

/**
 * Owns collections and recovery history for exactly one module provider identity.
 * @param props - Validated provider, required roles, and consuming subtree.
 * @returns Provider-scoped collection state and in-place expiry recovery.
 */
export const RolesProviderScope = ({
  provider,
  required,
  children,
}: RolesProviderScopeProps): ReactNode => {
  const store = useMemo(() => new RolesStore(provider), [provider]);
  // React must resubscribe after StrictMode cleanup even when the store identity is unchanged.
  // Subscribe directly rather than inheriting dependency caching from useObservableState.
  /**
   * Connects React notifications without transferring store disposal to subscription cleanup.
   * @param notify - React's external-store change callback.
   * @returns Cleanup for this subscription, not the shared store.
   */
  const subscribe = useCallback(
    (notify: () => void) => {
      const subscription = store.subscribe(notify);
      return () => subscription.unsubscribe();
    },
    [store],
  );
  /**
   * Exposes the reducer's stable snapshot identity between state transitions.
   * @returns The current provider-scoped state.
   */
  const getSnapshot = useCallback(() => store.value, [store]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const recovery = useExpiredRoleRecovery(state.claimable);
  const refreshInProgress = useRef(false);
  const lifecycle = useRef(0);

  useEffect(() => {
    const generation = ++lifecycle.current;
    // Collection failures are exposed by hook state. Disposal rejects only abandoned callers.
    void Promise.allSettled([store.loadActiveRoles(), store.loadClaimableRoles()]);
    return () => {
      // StrictMode immediately replays effects with the same store. Defer terminal disposal until
      // that replay can reclaim it; a genuine unmount/provider switch has no matching setup.
      queueMicrotask(() => {
        // A matching setup reclaims the store before this terminal cleanup may run.
        if (lifecycle.current === generation) {
          store.dispose();
        }
      });
    };
  }, [store]);

  /**
   * Coalesces passive refresh triggers without surfacing abandoned scope rejections.
   * @returns Settlement of both reads, or immediate completion when a refresh is already running.
   */
  const refreshRoles = useCallback(async (): Promise<void> => {
    // Focus and interval events can overlap, so only one network refresh should run at a time.
    if (refreshInProgress.current) {
      return;
    }
    refreshInProgress.current = true;
    try {
      await Promise.allSettled([store.loadActiveRoles(true), store.loadClaimableRoles(true)]);
    } finally {
      refreshInProgress.current = false;
    }
  }, [store]);

  useEffect(() => {
    /** Refreshes only while the document is visible so background tabs do not poll Roles V2. */
    const refreshWhenVisible = (): void => {
      // Hidden applications cannot need an immediate role-state update.
      if (document.visibilityState === 'visible') {
        void refreshRoles();
      }
    };

    const interval = window.setInterval(refreshWhenVisible, ROLE_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshRoles]);

  /**
   * Settles the active read independently of subsequent context state updates.
   * @returns Completion of the active collection request.
   */
  const reloadActive = useCallback(() => store.loadActiveRoles(true), [store]);
  /**
   * Settles the claimable read independently of subsequent context state updates.
   * @returns Completion of the claimable collection request.
   */
  const reloadClaimable = useCallback(() => store.loadClaimableRoles(true), [store]);
  /**
   * Preserves the activation action identity across loading and mutation state updates.
   * @param input - Addressable assignment and audit details.
   * @returns Mutation result after its collection refreshes settle.
   */
  const claimRole = useCallback(
    (input: ClaimRoleInput): Promise<RoleClaimResult> => store.claimRole(input),
    [store],
  );
  const { suppress, complete } = recovery;
  /**
   * Rolls back intentional-expiry suppression only when the mutation itself fails.
   * @param input - Assignment whose activation should end.
   * @returns Mutation result after its collection refreshes settle.
   * @throws Mutation rejection or disposal, preserving the store's imperative contract.
   */
  const deactivateRole = useCallback(
    async (input: DeactivateRoleInput): Promise<RoleDeactivateResult> => {
      const rollback = suppress(input.roleId);
      try {
        return await store.deactivateRole(input);
      } catch (error) {
        rollback();
        throw error;
      }
    },
    [store, suppress],
  );

  const value = useMemo<RolesContextValue>(
    () => ({
      active: {
        roles: state.active.roles,
        isLoading: state.active.status === 'loading',
        error: state.active.error,
        reload: reloadActive,
      },
      claimable: {
        roles: state.claimable.roles,
        isLoading: state.claimable.status === 'loading',
        error: state.claimable.error,
        reload: reloadClaimable,
        claimRole,
        deactivateRole,
        isClaiming: state.claim.pending > 0,
        claimError: state.claim.error,
        isDeactivating: state.deactivate.pending > 0,
        deactivateError: state.deactivate.error,
      },
    }),
    [state, reloadActive, reloadClaimable, claimRole, deactivateRole],
  );

  /**
   * Reclaims an expired role without remounting or reloading the consuming application.
   * @param roleId - Expired assignment identifier.
   * @param reason - User-confirmed audit reason.
   * @param hours - Requested activation duration.
   * @returns Settlement of activation and advancement of the recovery queue.
   * @throws Mutation rejection or disposal for the dialog to display.
   */
  const reclaimExpiredRole = async (
    roleId: string,
    reason: string,
    hours: number,
  ): Promise<void> => {
    await store.claimRole({ roleId, reason, hours });
    complete(roleId);
  };

  return (
    <RoleBoundary required={required}>
      <RolesContext.Provider value={value}>
        {children}
        <RoleClaimDialog
          claim={recovery.claim}
          defaultReason="Continue active work"
          isClaiming={state.claim.pending > 0}
          onClose={recovery.dismiss}
          onClaim={reclaimExpiredRole}
        />
      </RolesContext.Provider>
    </RoleBoundary>
  );
};

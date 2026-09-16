import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
  IRolesProvider,
} from '@equinor/fusion-framework-module-roles';

import { AccessRoleBoundary } from '../components/required-access/AccessRoleBoundary';
import { RoleClaimDialog } from '../components/claim/RoleClaimDialog';
import { RolesStore } from '../state/RolesStore';
import type {
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
} from '../state/roles-state';
import { RolesContext, type RolesContextValue } from './roles-context';
import type { RolesProviderProps } from './RolesProvider';
import { useExpiredClaimableRoleAssignmentRecovery } from './useExpiredClaimableRoleAssignmentRecovery';

const ROLE_ASSIGNMENT_REFRESH_INTERVAL_MS = 60_000;

/** The validated module provider defining this state lifetime. */
interface RolesProviderScopeProps extends RolesProviderProps {
  readonly provider: IRolesProvider;
}

/**
 * Owns collections and recovery history for exactly one module provider identity.
 * @param props - Validated provider, required access roles, and consuming subtree.
 * @returns Provider-scoped collection state and in-place expiry recovery.
 */
export const RolesProviderScope = ({
  provider,
  requiredAccessRoles,
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
  const recovery = useExpiredClaimableRoleAssignmentRecovery(
    state.consolidatedClaimableRoleAssignments,
  );
  const refreshInProgress = useRef(false);
  const lifecycle = useRef(0);

  useEffect(() => {
    const generation = ++lifecycle.current;
    // Collection failures are exposed by hook state. Disposal rejects only abandoned callers.
    void Promise.allSettled([
      store.loadActiveAccessRoleAssignments(),
      store.loadConsolidatedClaimableRoleAssignments(),
      store.loadConsolidatedRoleAssignments(),
    ]);
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
   * @returns Settlement of all collection reads, or immediate completion when one is already running.
   */
  const refreshRoleAssignments = useCallback(async (): Promise<void> => {
    // Focus and interval events can overlap, so only one network refresh should run at a time.
    if (refreshInProgress.current) {
      return;
    }
    refreshInProgress.current = true;
    try {
      await Promise.allSettled([
        store.loadActiveAccessRoleAssignments(true),
        store.loadConsolidatedClaimableRoleAssignments(true),
        store.loadConsolidatedRoleAssignments(true),
      ]);
    } finally {
      refreshInProgress.current = false;
    }
  }, [store]);

  useEffect(() => {
    /** Refreshes only while the document is visible so background tabs do not poll Roles V2. */
    const refreshWhenVisible = (): void => {
      // Hidden applications cannot need an immediate role-state update.
      if (document.visibilityState === 'visible') {
        void refreshRoleAssignments();
      }
    };

    const interval = window.setInterval(refreshWhenVisible, ROLE_ASSIGNMENT_REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshRoleAssignments]);

  /**
   * Settles the active access-role assignment read independently of subsequent context updates.
   * @returns Completion of the active access-role assignment request.
   */
  const reloadActiveAccessRoleAssignments = useCallback(
    () => store.loadActiveAccessRoleAssignments(true),
    [store],
  );
  /**
   * Settles the claimable read independently of subsequent context state updates.
   * @returns Completion of the consolidated claimable-role-assignment request.
   */
  const reloadConsolidatedClaimableRoleAssignments = useCallback(
    () => store.loadConsolidatedClaimableRoleAssignments(true),
    [store],
  );
  /**
   * Settles the consolidated read independently of subsequent context state updates.
   * @returns Completion of the consolidated role-assignment request.
   */
  const reloadConsolidatedRoleAssignments = useCallback(
    () => store.loadConsolidatedRoleAssignments(true),
    [store],
  );
  /**
   * Preserves the activation action identity across loading and mutation state updates.
   * @param input - Addressable assignment and audit details.
   * @returns Mutation result after its collection refreshes settle.
   */
  const activateClaimableRoleAssignment = useCallback(
    (
      input: ActivateClaimableRoleAssignmentInput,
    ): Promise<ClaimableRoleAssignmentActivationResult> =>
      store.activateClaimableRoleAssignment(input),
    [store],
  );
  const { suppress, complete } = recovery;
  /**
   * Rolls back intentional-expiry suppression only when the mutation itself fails.
   * @param input - Assignment whose activation should end.
   * @returns Mutation result after its collection refreshes settle.
   * @throws Mutation rejection or disposal, preserving the store's imperative contract.
   */
  const deactivateClaimableRoleAssignment = useCallback(
    async (
      input: DeactivateClaimableRoleAssignmentInput,
    ): Promise<ClaimableRoleAssignmentDeactivationResult> => {
      const rollback = suppress(input.assignmentId);
      try {
        return await store.deactivateClaimableRoleAssignment(input);
      } catch (error) {
        rollback();
        throw error;
      }
    },
    [store, suppress],
  );

  const value = useMemo<RolesContextValue>(
    () => ({
      activeAccessRoleAssignments: {
        assignments: state.activeAccessRoleAssignments.assignments,
        isLoading: state.activeAccessRoleAssignments.status === 'loading',
        error: state.activeAccessRoleAssignments.error,
        reload: reloadActiveAccessRoleAssignments,
      },
      consolidatedClaimableRoleAssignments: {
        assignments: state.consolidatedClaimableRoleAssignments.assignments,
        isLoading: state.consolidatedClaimableRoleAssignments.status === 'loading',
        error: state.consolidatedClaimableRoleAssignments.error,
        reload: reloadConsolidatedClaimableRoleAssignments,
        activateClaimableRoleAssignment,
        deactivateClaimableRoleAssignment,
        isActivating: state.activation.pending > 0,
        activationError: state.activation.error,
        isDeactivating: state.deactivation.pending > 0,
        deactivationError: state.deactivation.error,
      },
      consolidatedRoleAssignments: {
        assignments: state.consolidatedRoleAssignments.assignments,
        isLoading: state.consolidatedRoleAssignments.status === 'loading',
        error: state.consolidatedRoleAssignments.error,
        reload: reloadConsolidatedRoleAssignments,
      },
    }),
    [
      state,
      reloadActiveAccessRoleAssignments,
      reloadConsolidatedClaimableRoleAssignments,
      reloadConsolidatedRoleAssignments,
      activateClaimableRoleAssignment,
      deactivateClaimableRoleAssignment,
    ],
  );

  /**
   * Reactivates an expired claimable role assignment without remounting or reloading the
   * consuming application.
   * @param assignmentId - Expired claimable role assignment identifier.
   * @param reason - User-confirmed audit reason.
   * @param hours - Requested activation duration.
   * @returns Settlement of activation and advancement of the recovery queue.
   * @throws Mutation rejection or disposal for the dialog to display.
   */
  const activateExpiredClaimableRoleAssignment = async (
    assignmentId: string,
    reason: string,
    hours: number,
  ): Promise<void> => {
    await store.activateClaimableRoleAssignment({ assignmentId, reason, hours });
    complete(assignmentId);
  };

  return (
    <AccessRoleBoundary requiredAccessRoles={requiredAccessRoles}>
      <RolesContext.Provider value={value}>
        {children}
        <RoleClaimDialog
          claimableRoleAssignment={recovery.claimableRoleAssignment}
          defaultReason="Continue active work"
          isActivating={state.activation.pending > 0}
          onClose={recovery.dismiss}
          onActivate={activateExpiredClaimableRoleAssignment}
        />
      </RolesContext.Provider>
    </AccessRoleBoundary>
  );
};

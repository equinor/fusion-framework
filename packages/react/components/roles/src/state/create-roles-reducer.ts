import { castDraft, createReducer } from '@equinor/fusion-observable';

import { rolesActions, type RolesAction } from './roles-actions';
import type { RolesState } from './roles-state';

const initialState: RolesState = {
  activeAccessRoleAssignments: {
    assignments: [],
    status: 'loading',
    error: undefined,
    operationId: 0,
  },
  consolidatedClaimableRoleAssignments: {
    assignments: [],
    status: 'loading',
    error: undefined,
    operationId: 0,
  },
  consolidatedRoleAssignments: {
    assignments: [],
    status: 'loading',
    error: undefined,
    operationId: 0,
  },
  activation: {
    pending: 0,
    error: undefined,
  },
  deactivation: {
    pending: 0,
    error: undefined,
  },
};

/**
 * Keeps latest-started collection snapshots separate from independently settling mutation callers.
 * @returns A reducer retaining stale data during refresh and ignoring obsolete collection outcomes.
 */
export const createRolesReducer = (): ReturnType<typeof createReducer<RolesState, RolesAction>> =>
  createReducer<RolesState, RolesAction>(initialState, (builder) => {
    // A new active access-role assignment read owns subsequent outcomes; retain the last snapshot during refresh.
    builder.addCase(rolesActions.loadActiveAccessRoleAssignments, (state, action) => {
      state.activeAccessRoleAssignments.status = 'loading';
      state.activeAccessRoleAssignments.error = undefined;
      state.activeAccessRoleAssignments.operationId = action.meta.operationId;
    });

    // Accept the active access-role assignment snapshot only for the latest-started read, so late results cannot roll it back.
    builder.addCase(rolesActions.loadActiveAccessRoleAssignments.success, (state, action) => {
      // A superseded read still settles its caller, but no longer owns this collection.
      if (state.activeAccessRoleAssignments.operationId === action.meta.operationId) {
        state.activeAccessRoleAssignments.assignments = castDraft(action.payload);
        state.activeAccessRoleAssignments.status = 'success';
      }
    });

    // Expose the current active access-role assignment read failure without discarding usable data or surfacing stale errors.
    builder.addCase(rolesActions.loadActiveAccessRoleAssignments.failure, (state, action) => {
      // Ignore obsolete failures so a slower request cannot mask the current read's outcome.
      if (state.activeAccessRoleAssignments.operationId === action.meta.operationId) {
        state.activeAccessRoleAssignments.error = action.payload;
        state.activeAccessRoleAssignments.status = 'error';
      }
    });

    // A new claimable-role-assignment read clears its previous error, but keeps assignments visible while refreshing.
    builder.addCase(rolesActions.loadConsolidatedClaimableRoleAssignments, (state, action) => {
      state.consolidatedClaimableRoleAssignments.status = 'loading';
      state.consolidatedClaimableRoleAssignments.error = undefined;
      state.consolidatedClaimableRoleAssignments.operationId = action.meta.operationId;
    });

    // Accept claimable role assignments only for the latest-started read, preserving newer eligibility information.
    builder.addCase(
      rolesActions.loadConsolidatedClaimableRoleAssignments.success,
      (state, action) => {
        // A superseded read still settles its caller, but no longer owns this collection.
        if (state.consolidatedClaimableRoleAssignments.operationId === action.meta.operationId) {
          state.consolidatedClaimableRoleAssignments.assignments = castDraft(action.payload);
          state.consolidatedClaimableRoleAssignments.status = 'success';
        }
      },
    );

    // Expose the current claimable-role-assignment failure while retaining assignments; obsolete failures must not replace newer status.
    builder.addCase(
      rolesActions.loadConsolidatedClaimableRoleAssignments.failure,
      (state, action) => {
        // Ignore obsolete failures so a slower request cannot mask the current read's outcome.
        if (state.consolidatedClaimableRoleAssignments.operationId === action.meta.operationId) {
          state.consolidatedClaimableRoleAssignments.error = action.payload;
          state.consolidatedClaimableRoleAssignments.status = 'error';
        }
      },
    );

    // A new consolidated role-assignment read clears its previous error, but keeps assignments visible while refreshing.
    // Consolidated role assignments are outside activation and deactivation, so this collection has no
    // mutation-refresh cases: it is loaded independently and never reloaded as a side effect of an activation.
    builder.addCase(rolesActions.loadConsolidatedRoleAssignments, (state, action) => {
      state.consolidatedRoleAssignments.status = 'loading';
      state.consolidatedRoleAssignments.error = undefined;
      state.consolidatedRoleAssignments.operationId = action.meta.operationId;
    });

    // Accept consolidated role assignments only for the latest-started read, so late results cannot roll it back.
    builder.addCase(rolesActions.loadConsolidatedRoleAssignments.success, (state, action) => {
      // A superseded read still settles its caller, but no longer owns this collection.
      if (state.consolidatedRoleAssignments.operationId === action.meta.operationId) {
        state.consolidatedRoleAssignments.assignments = castDraft(action.payload);
        state.consolidatedRoleAssignments.status = 'success';
      }
    });

    // Expose the current consolidated role-assignment failure while retaining assignments; obsolete failures must not replace newer status.
    builder.addCase(rolesActions.loadConsolidatedRoleAssignments.failure, (state, action) => {
      // Ignore obsolete failures so a slower request cannot mask the current read's outcome.
      if (state.consolidatedRoleAssignments.operationId === action.meta.operationId) {
        state.consolidatedRoleAssignments.error = action.payload;
        state.consolidatedRoleAssignments.status = 'error';
      }
    });

    // Track every activation independently so one completion cannot clear another activation's busy state.
    // A new attempt dismisses the previous activation error, not collection refresh errors.
    builder.addCase(rolesActions.activateClaimableRoleAssignment, (state) => {
      state.activation.pending += 1;
      state.activation.error = undefined;
    });

    // Activation has committed: refresh active access and claimable assignments under their own request identities.
    // Retain both snapshots until reads settle rather than optimistically guessing the service's assignment changes.
    builder.addCase(rolesActions.refreshAfterActivation, (state, action) => {
      state.activeAccessRoleAssignments.status = 'loading';
      state.activeAccessRoleAssignments.error = undefined;
      state.activeAccessRoleAssignments.operationId = action.payload.activeAccessOperationId;
      state.consolidatedClaimableRoleAssignments.status = 'loading';
      state.consolidatedClaimableRoleAssignments.error = undefined;
      state.consolidatedClaimableRoleAssignments.operationId = action.payload.claimableOperationId;
    });

    // Activation and both follow-up reads have settled; release only this activation's pending slot.
    // Collection failures stay separate, and another concurrent activation's error must remain visible.
    builder.addCase(rolesActions.activateClaimableRoleAssignment.success, (state) => {
      state.activation.pending -= 1;
    });

    // Activation failed: expose its error and release its pending slot without disturbing other mutations or snapshots.
    builder.addCase(rolesActions.activateClaimableRoleAssignment.failure, (state, action) => {
      state.activation.pending -= 1;
      state.activation.error = action.payload;
    });

    // Track overlapping deactivations independently and clear the previous mutation error for the new attempt.
    builder.addCase(rolesActions.deactivateClaimableRoleAssignment, (state) => {
      state.deactivation.pending += 1;
      state.deactivation.error = undefined;
    });

    // Deactivation has committed: reconcile active access and claimable assignments with the service instead of removing rows optimistically.
    // Give each follow-up read its own identity while keeping the existing snapshots available.
    builder.addCase(rolesActions.refreshAfterDeactivation, (state, action) => {
      state.activeAccessRoleAssignments.status = 'loading';
      state.activeAccessRoleAssignments.error = undefined;
      state.activeAccessRoleAssignments.operationId = action.payload.activeAccessOperationId;
      state.consolidatedClaimableRoleAssignments.status = 'loading';
      state.consolidatedClaimableRoleAssignments.error = undefined;
      state.consolidatedClaimableRoleAssignments.operationId = action.payload.claimableOperationId;
    });

    // Deactivation and both follow-up reads have settled; release only this operation's pending slot.
    // Preserve collection errors and any failure from a concurrent deactivation.
    builder.addCase(rolesActions.deactivateClaimableRoleAssignment.success, (state) => {
      state.deactivation.pending -= 1;
    });

    // Deactivation failed: retain the displayed assignments and expose the failure without clearing other pending work.
    builder.addCase(rolesActions.deactivateClaimableRoleAssignment.failure, (state, action) => {
      state.deactivation.pending -= 1;
      state.deactivation.error = action.payload;
    });
  });

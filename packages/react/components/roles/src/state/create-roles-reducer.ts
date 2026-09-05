import { castDraft, createReducer } from '@equinor/fusion-observable';

import { rolesActions, type RolesAction } from './roles-actions';
import type { RolesState } from './roles-state';

const initialState: RolesState = {
  active: {
    roles: [],
    status: 'loading',
    error: undefined,
    operationId: 0,
  },
  claimable: {
    roles: [],
    status: 'loading',
    error: undefined,
    operationId: 0,
  },
  claim: {
    pending: 0,
    error: undefined,
  },
  deactivate: {
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
    // A new active-role read owns subsequent outcomes; retain the last snapshot during refresh.
    builder.addCase(rolesActions.loadActive, (state, action) => {
      state.active.status = 'loading';
      state.active.error = undefined;
      state.active.operationId = action.meta.operationId;
    });

    // Accept the active-role snapshot only for the latest-started read, so late results cannot roll it back.
    builder.addCase(rolesActions.loadActive.success, (state, action) => {
      // A superseded read still settles its caller, but no longer owns this collection.
      if (state.active.operationId === action.meta.operationId) {
        state.active.roles = castDraft(action.payload);
        state.active.status = 'success';
      }
    });

    // Expose the current active-role read failure without discarding usable data or surfacing stale errors.
    builder.addCase(rolesActions.loadActive.failure, (state, action) => {
      // Ignore obsolete failures so a slower request cannot mask the current read's outcome.
      if (state.active.operationId === action.meta.operationId) {
        state.active.error = action.payload;
        state.active.status = 'error';
      }
    });

    // A new claimability read clears its previous error, but keeps assignments visible while refreshing.
    builder.addCase(rolesActions.loadClaimable, (state, action) => {
      state.claimable.status = 'loading';
      state.claimable.error = undefined;
      state.claimable.operationId = action.meta.operationId;
    });

    // Accept claimable assignments only for the latest-started read, preserving newer eligibility information.
    builder.addCase(rolesActions.loadClaimable.success, (state, action) => {
      // A superseded read still settles its caller, but no longer owns this collection.
      if (state.claimable.operationId === action.meta.operationId) {
        state.claimable.roles = castDraft(action.payload);
        state.claimable.status = 'success';
      }
    });

    // Expose the current claimability failure while retaining assignments; obsolete failures must not replace newer status.
    builder.addCase(rolesActions.loadClaimable.failure, (state, action) => {
      // Ignore obsolete failures so a slower request cannot mask the current read's outcome.
      if (state.claimable.operationId === action.meta.operationId) {
        state.claimable.error = action.payload;
        state.claimable.status = 'error';
      }
    });

    // Track every activation independently so one completion cannot clear another activation's busy state.
    // A new attempt dismisses the previous activation error, not collection refresh errors.
    builder.addCase(rolesActions.claimRole, (state) => {
      state.claim.pending += 1;
      state.claim.error = undefined;
    });

    // Activation has committed: refresh both access and eligibility under their own request identities.
    // Retain both snapshots until reads settle rather than optimistically guessing the service's assignment changes.
    builder.addCase(rolesActions.refreshAfterClaim, (state, action) => {
      state.active.status = 'loading';
      state.active.error = undefined;
      state.active.operationId = action.payload.activeOperationId;
      state.claimable.status = 'loading';
      state.claimable.error = undefined;
      state.claimable.operationId = action.payload.claimableOperationId;
    });

    // Activation and both follow-up reads have settled; release only this activation's pending slot.
    // Collection failures stay separate, and another concurrent activation's error must remain visible.
    builder.addCase(rolesActions.claimRole.success, (state) => {
      state.claim.pending -= 1;
    });

    // Activation failed: expose its error and release its pending slot without disturbing other mutations or snapshots.
    builder.addCase(rolesActions.claimRole.failure, (state, action) => {
      state.claim.pending -= 1;
      state.claim.error = action.payload;
    });

    // Track overlapping deactivations independently and clear the previous mutation error for the new attempt.
    builder.addCase(rolesActions.deactivateRole, (state) => {
      state.deactivate.pending += 1;
      state.deactivate.error = undefined;
    });

    // Deactivation has committed: reconcile access and claimability with the service instead of removing rows optimistically.
    // Give each follow-up read its own identity while keeping the existing snapshots available.
    builder.addCase(rolesActions.refreshAfterDeactivate, (state, action) => {
      state.active.status = 'loading';
      state.active.error = undefined;
      state.active.operationId = action.payload.activeOperationId;
      state.claimable.status = 'loading';
      state.claimable.error = undefined;
      state.claimable.operationId = action.payload.claimableOperationId;
    });

    // Deactivation and both follow-up reads have settled; release only this operation's pending slot.
    // Preserve collection errors and any failure from a concurrent deactivation.
    builder.addCase(rolesActions.deactivateRole.success, (state) => {
      state.deactivate.pending -= 1;
    });

    // Deactivation failed: retain the displayed assignments and expose the failure without clearing other pending work.
    builder.addCase(rolesActions.deactivateRole.failure, (state, action) => {
      state.deactivate.pending -= 1;
      state.deactivate.error = action.payload;
    });
  });

import { firstValueFrom, type Subscription } from 'rxjs';
import { filter, throwIfEmpty } from 'rxjs/operators';

import { FlowSubject } from '@equinor/fusion-observable';
import type {
  ActivateClaimableRoleAssignmentInput,
  DeactivateClaimableRoleAssignmentInput,
  IRolesProvider,
} from '@equinor/fusion-framework-module-roles';

import { rolesActions, type RolesAction } from './roles-actions';
import { createRolesReducer } from './create-roles-reducer';
import { createRolesFlow } from './create-roles-flow';
import type {
  ClaimableRoleAssignmentActivationResult,
  ClaimableRoleAssignmentDeactivationResult,
  RolesState,
} from './roles-state';

/**
 * Observable application state and actions for Roles V2 assignment collections and
 * claimable-role-assignment mutations.
 */
export class RolesStore extends FlowSubject<RolesState, RolesAction> {
  #operationId = 0;
  #disposed = false;
  readonly #flow: Subscription;

  /**
   * Creates an observable roles store connected to an app-scoped provider.
   *
   * @param provider - Roles provider used by the store flows.
   */
  public constructor(provider: IRolesProvider) {
    super(createRolesReducer());
    this.#flow = this.addFlow(createRolesFlow(provider));
  }

  /**
   * Permanently disposes the store and rejects pending imperative operations.
   *
   * Uses the observable base lifecycle so state and action subscribers also complete.
   * Provider promises cannot be aborted, but their late results no longer update the store.
   * Repeated disposal is safe; a disposed store must not be reused.
   */
  public dispose(): void {
    // Completion alone does not cancel the mergeMap requests owned by the registered flow.
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    this.#flow.unsubscribe();
    super.complete();
  }

  /** Completes observers and settles callers using the same lifecycle as disposal. */
  public override complete(): void {
    this.dispose();
  }

  /** Settles callers before the base class disconnects its subjects. */
  public override unsubscribe(): void {
    this.dispose();
    super.unsubscribe();
  }

  /**
   * Prevents operations from waiting on a store whose action stream has already completed.
   * @throws When the store has been disposed.
   */
  #assertAvailable(): void {
    // Fail before subscribing or dispatching so post-disposal calls cannot remain pending.
    if (this.#disposed) {
      throw new Error('Roles store has been disposed.');
    }
  }

  /**
   * Reloads active access-role assignments.
   *
   * @param refresh - Whether to invalidate the provider cache before loading.
   * @returns Completion of this request; collection errors are exposed in state.
   * @throws When the store is disposed before the request completes.
   */
  public async loadActiveAccessRoleAssignments(refresh = false): Promise<void> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Resolve when this operation completes, even if a newer reload supersedes its state update.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.loadActiveAccessRoleAssignments.success.match(action) ||
              rolesActions.loadActiveAccessRoleAssignments.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(rolesActions.loadActiveAccessRoleAssignments(operationId, refresh));
    await completed;
  }

  /**
   * Reloads consolidated claimable role assignments.
   *
   * @param refresh - Whether to invalidate the provider cache before loading.
   * @returns Completion of this request; collection errors are exposed in state.
   * @throws When the store is disposed before the request completes.
   */
  public async loadConsolidatedClaimableRoleAssignments(refresh = false): Promise<void> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Resolve when this operation completes, even if a newer reload supersedes its state update.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.loadConsolidatedClaimableRoleAssignments.success.match(action) ||
              rolesActions.loadConsolidatedClaimableRoleAssignments.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(rolesActions.loadConsolidatedClaimableRoleAssignments(operationId, refresh));
    await completed;
  }

  /**
   * Reloads consolidated role assignments.
   *
   * @param refresh - Whether to invalidate the provider cache before loading.
   * @returns Completion of this request; collection errors are exposed in state.
   * @throws When the store is disposed before the request completes.
   */
  public async loadConsolidatedRoleAssignments(refresh = false): Promise<void> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Resolve when this operation completes, even if a newer reload supersedes its state update.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.loadConsolidatedRoleAssignments.success.match(action) ||
              rolesActions.loadConsolidatedRoleAssignments.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(rolesActions.loadConsolidatedRoleAssignments(operationId, refresh));
    await completed;
  }

  /**
   * Activates one claimable role assignment and waits for both mutated collections to refresh.
   *
   * @param input - Claimable role assignment, activation duration, and audit reason.
   * @returns The activation result even when a subsequent collection refresh fails.
   * @throws The provider error when activation fails, or an error when the store is disposed.
   */
  public async activateClaimableRoleAssignment(
    input: ActivateClaimableRoleAssignmentInput,
  ): Promise<ClaimableRoleAssignmentActivationResult> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Correlate the imperative promise with the matching asynchronous action outcome.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.activateClaimableRoleAssignment.success.match(action) ||
              rolesActions.activateClaimableRoleAssignment.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(
      rolesActions.activateClaimableRoleAssignment({
        input,
        operationId,
        activeAccessOperationId: ++this.#operationId,
        claimableOperationId: ++this.#operationId,
      }),
    );
    const action = await completed;
    // Preserve provider failures for imperative callers as well as observable state consumers.
    if (rolesActions.activateClaimableRoleAssignment.failure.match(action)) {
      throw action.payload;
    }
    // The correlated terminal action can only be success or failure.
    if (rolesActions.activateClaimableRoleAssignment.success.match(action)) {
      return action.payload;
    }
    throw new Error('Claimable role assignment activation completed without a result.');
  }

  /**
   * Deactivates one activated claimable role assignment and waits for both mutated collections to refresh.
   *
   * @param input - Claimable role assignment to deactivate.
   * @returns The deactivation result even when a subsequent collection refresh fails.
   * @throws The provider error when deactivation fails, or an error when the store is disposed.
   */
  public async deactivateClaimableRoleAssignment(
    input: DeactivateClaimableRoleAssignmentInput,
  ): Promise<ClaimableRoleAssignmentDeactivationResult> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Correlate the imperative promise with the matching asynchronous action outcome.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.deactivateClaimableRoleAssignment.success.match(action) ||
              rolesActions.deactivateClaimableRoleAssignment.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(
      rolesActions.deactivateClaimableRoleAssignment({
        input,
        operationId,
        activeAccessOperationId: ++this.#operationId,
        claimableOperationId: ++this.#operationId,
      }),
    );
    const action = await completed;
    // Preserve provider failures for imperative callers and observable consumers.
    if (rolesActions.deactivateClaimableRoleAssignment.failure.match(action)) {
      throw action.payload;
    }
    // The correlated terminal action can only be success or failure.
    if (rolesActions.deactivateClaimableRoleAssignment.success.match(action)) {
      return action.payload;
    }
    throw new Error('Claimable role assignment deactivation completed without a result.');
  }
}

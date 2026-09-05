import { firstValueFrom, type Subscription } from 'rxjs';
import { filter, throwIfEmpty } from 'rxjs/operators';

import { FlowSubject } from '@equinor/fusion-observable';
import type {
  ClaimRoleInput,
  DeactivateRoleInput,
  IRolesProvider,
} from '@equinor/fusion-framework-module-roles';

import { rolesActions, type RolesAction } from './roles-actions';
import { createRolesReducer } from './create-roles-reducer';
import { createRolesFlow } from './create-roles-flow';
import type { RoleClaimResult, RoleDeactivateResult, RolesState } from './roles-state';

/**
 * Observable application state and actions for Roles V2 collections and activation.
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
   * Reloads active role assignments.
   *
   * @param refresh - Whether to invalidate the provider cache before loading.
   * @returns Completion of this request; collection errors are exposed in state.
   * @throws When the store is disposed before the request completes.
   */
  public async loadActiveRoles(refresh = false): Promise<void> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Resolve when this operation completes, even if a newer reload supersedes its state update.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.loadActive.success.match(action) ||
              rolesActions.loadActive.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(rolesActions.loadActive(operationId, refresh));
    await completed;
  }

  /**
   * Reloads claimable role assignments.
   *
   * @param refresh - Whether to invalidate the provider cache before loading.
   * @returns Completion of this request; collection errors are exposed in state.
   * @throws When the store is disposed before the request completes.
   */
  public async loadClaimableRoles(refresh = false): Promise<void> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Resolve when this operation completes, even if a newer reload supersedes its state update.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.loadClaimable.success.match(action) ||
              rolesActions.loadClaimable.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(rolesActions.loadClaimable(operationId, refresh));
    await completed;
  }

  /**
   * Activates one role assignment and waits for both role domains to refresh.
   *
   * @param input - Role assignment, activation duration, and audit reason.
   * @returns The activation result even when a subsequent collection refresh fails.
   * @throws The provider error when activation fails, or an error when the store is disposed.
   */
  public async claimRole(input: ClaimRoleInput): Promise<RoleClaimResult> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Correlate the imperative promise with the matching asynchronous action outcome.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.claimRole.success.match(action) ||
              rolesActions.claimRole.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(
      rolesActions.claimRole({
        input,
        operationId,
        activeOperationId: ++this.#operationId,
        claimableOperationId: ++this.#operationId,
      }),
    );
    const action = await completed;
    // Preserve provider failures for imperative callers as well as observable state consumers.
    if (rolesActions.claimRole.failure.match(action)) {
      throw action.payload;
    }
    // The correlated terminal action can only be success or failure.
    if (rolesActions.claimRole.success.match(action)) {
      return action.payload;
    }
    throw new Error('Role activation completed without a result.');
  }

  /**
   * Deactivates one claimed assignment and waits for both role domains to refresh.
   *
   * @param input - Claimable assignment to deactivate.
   * @returns The deactivation result even when a subsequent collection refresh fails.
   * @throws The provider error when deactivation fails, or an error when the store is disposed.
   */
  public async deactivateRole(input: DeactivateRoleInput): Promise<RoleDeactivateResult> {
    this.#assertAvailable();
    const operationId = ++this.#operationId;
    // Correlate the imperative promise with the matching asynchronous action outcome.
    const completed = firstValueFrom(
      this.action$.pipe(
        filter(
          (action) =>
            (rolesActions.deactivateRole.success.match(action) ||
              rolesActions.deactivateRole.failure.match(action)) &&
            action.meta.operationId === operationId,
        ),
        throwIfEmpty(() => new Error('Roles store has been disposed.')),
      ),
    );
    this.next(
      rolesActions.deactivateRole({
        input,
        operationId,
        activeOperationId: ++this.#operationId,
        claimableOperationId: ++this.#operationId,
      }),
    );
    const action = await completed;
    // Preserve provider failures for imperative callers and observable consumers.
    if (rolesActions.deactivateRole.failure.match(action)) {
      throw action.payload;
    }
    // The correlated terminal action can only be success or failure.
    if (rolesActions.deactivateRole.success.match(action)) {
      return action.payload;
    }
    throw new Error('Role deactivation completed without a result.');
  }
}

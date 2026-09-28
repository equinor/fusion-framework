import { FlowSubject } from '@equinor/fusion-observable';

import type { IRolesProvider } from '../RolesProvider.js';
import type { AccessRoleCheck, AccessRoleCheckState } from './access-role-check.js';

type AccessRoleCheckAction =
  | { type: 'load' }
  | { type: 'success'; hasAccessRole: boolean }
  | { type: 'failure'; error: unknown };

const initialState: AccessRoleCheckState = {
  hasAccessRole: undefined,
  isLoading: true,
  error: undefined,
};

/**
 * Reduces active access-role request outcomes into observable state.
 *
 * @param state - Current access-check state.
 * @param action - Request lifecycle transition.
 * @returns Updated access-check state.
 */
const reduceAccessRoleCheck = (
  state: AccessRoleCheckState,
  action: AccessRoleCheckAction,
): AccessRoleCheckState => {
  // Each transition preserves the last resolved value so background refreshes do not hide content.
  switch (action.type) {
    case 'load':
      return { ...state, isLoading: true, error: undefined };
    case 'success':
      return { hasAccessRole: action.hasAccessRole, isLoading: false, error: undefined };
    case 'failure':
      return { ...state, isLoading: false, error: action.error };
  }
};

/**
 * Owns one immutable access-role predicate and its asynchronous request ordering.
 */
export class AccessRoleCheckController implements AccessRoleCheck {
  readonly #state = new FlowSubject<AccessRoleCheckState, AccessRoleCheckAction>(
    reduceAccessRoleCheck,
    initialState,
  );
  readonly #provider: Pick<IRolesProvider, 'hasAccessRole'>;
  readonly #accessRoleNames: readonly string[];
  readonly #required: boolean;
  #operationId = 0;
  #disposed = false;

  /** {@inheritDoc AccessRoleCheck.state$} */
  public readonly state$ = this.#state.select((state) => state);

  /**
   * Creates a check for one immutable provider, role-name list, and matching mode.
   *
   * @param provider - Roles provider executing the active-only predicate.
   * @param accessRoleNames - Exact access-role names captured for this check.
   * @param required - Whether every role is required instead of any role.
   */
  public constructor(
    provider: Pick<IRolesProvider, 'hasAccessRole'>,
    accessRoleNames: readonly string[],
    required: boolean,
  ) {
    this.#provider = provider;
    this.#accessRoleNames = [...accessRoleNames];
    this.#required = required;
  }

  /** {@inheritDoc AccessRoleCheck.state} */
  public get state(): AccessRoleCheckState {
    return this.#state.value;
  }

  /** {@inheritDoc AccessRoleCheck.load} */
  public readonly load = (): Promise<void> => this.#execute(false);

  /** {@inheritDoc AccessRoleCheck.refresh} */
  public readonly refresh = (): Promise<void> => this.#execute(true);

  /** {@inheritDoc AccessRoleCheck.subscribe} */
  public readonly subscribe = (onStoreChange: VoidFunction): VoidFunction => {
    const subscription = this.state$.subscribe(onStoreChange);
    return () => subscription.unsubscribe();
  };

  /** {@inheritDoc AccessRoleCheck.getSnapshot} */
  public readonly getSnapshot = (): AccessRoleCheckState => this.state;

  /** {@inheritDoc AccessRoleCheck.dispose} */
  public readonly dispose = (): void => {
    // Invalidate pending operations before completing observable state.
    if (!this.#disposed) {
      this.#disposed = true;
      this.#operationId += 1;
      this.#state.complete();
    }
  };

  /**
   * Runs the predicate and lets only the newest operation update observable state.
   *
   * @param refresh - Whether the provider should invalidate cached active assignments first.
   * @returns Completion of the access check.
   * @throws The original provider failure after publishing it to state.
   */
  async #execute(refresh: boolean): Promise<void> {
    // A disposed resource cannot own or publish another request.
    if (this.#disposed) {
      throw new Error('Access role check has been disposed.');
    }
    const operationId = ++this.#operationId;
    this.#state.next({ type: 'load' });
    try {
      const hasAccessRole = await this.#provider.hasAccessRole(this.#accessRoleNames, {
        required: this.#required,
        refresh,
      });
      // A slower operation cannot replace the result of a newer load or refresh.
      if (operationId === this.#operationId) {
        this.#state.next({ type: 'success', hasAccessRole });
      }
    } catch (error) {
      // Only the current operation owns visible error and loading state.
      if (operationId === this.#operationId) {
        this.#state.next({ type: 'failure', error });
      }
      throw error;
    }
  }
}

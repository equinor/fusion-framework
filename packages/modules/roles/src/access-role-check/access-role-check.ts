import type { Observable } from 'rxjs';

/** Current state of an active access-role check. */
export interface AccessRoleCheckState {
  /** Whether the configured any-role or all-role condition is satisfied. */
  readonly hasAccessRole: boolean | undefined;
  /** Whether the initial load or an explicit refresh is running. */
  readonly isLoading: boolean;
  /** Error from the latest active access-role check. */
  readonly error: unknown;
}

/** Module-owned active access-role check state and actions. */
export interface AccessRoleCheck {
  /** Observable active-access state. */
  readonly state$: Observable<AccessRoleCheckState>;
  /** Current active-access state. */
  readonly state: AccessRoleCheckState;
  /** Performs the initial cache-aware access check. */
  readonly load: () => Promise<void>;
  /** Invalidates cached active assignments before checking access again. */
  readonly refresh: () => Promise<void>;
  /** Subscribes an external-store change listener. */
  readonly subscribe: (onStoreChange: VoidFunction) => VoidFunction;
  /** Returns the current state snapshot. */
  readonly getSnapshot: () => AccessRoleCheckState;
  /** Completes the state stream and prevents further checks. */
  readonly dispose: VoidFunction;
}

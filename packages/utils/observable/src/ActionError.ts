import type { Action } from './types';

/**
 * An error class that wraps a causal error together with the action that triggered it.
 *
 * Useful for propagating error context through action-based state management flows,
 * so that error handlers have access to both the original error and the action
 * that was being processed when the error occurred.
 *
 * @template TAction - The action type associated with the error.
 * @template TCause - The underlying error type.
 *
 * @example
 * ```ts
 * import { ActionError } from '@equinor/fusion-observable';
 *
 * const action = { type: 'FETCH_DATA', payload: { id: '123' } };
 * const cause = new Error('Network timeout');
 * const error = new ActionError(action, cause);
 * console.log(error.message); // 'Network timeout'
 * console.log(error.action.type); // 'FETCH_DATA'
 * ```
 */
export class ActionError<
  TAction extends Action = Action,
  TCause extends Error = Error,
> extends Error {
  /**
   * Creates a new `ActionError`.
   *
   * @param action - The action that was being processed when the error occurred.
   * @param cause - The underlying error that caused the failure.
   * @param msg - An optional custom error message. Defaults to the cause's message.
   */
  constructor(
    public action: TAction,
    public cause: TCause,
    msg?: string,
  ) {
    super(msg ?? cause.message);
  }
}

export default ActionError;

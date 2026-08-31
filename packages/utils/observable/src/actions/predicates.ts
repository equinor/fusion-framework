import type { Action, ActionWithSuffix, AnyAction } from './types.js';
import { matchActionSuffix } from './utils.js';

/**
 * Checks whether an action type ends with a specific lifecycle suffix.
 *
 * @template A - The action type.
 * @template Suffix - The expected suffix string.
 * @param action - The action to check.
 * @param suffix - The suffix to look for.
 * @returns `true` if the action type ends with the requested suffix.
 */
export function isActionWithSuffix<A extends Action, Suffix extends string>(
  action: A,
  suffix: Suffix,
): action is ActionWithSuffix<A, Suffix> {
  return !!action.type.match(matchActionSuffix(suffix));
}

/**
 * Checks whether an action is a request lifecycle action.
 *
 * @template A - The action type.
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::request`.
 */
export const isRequestAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'request'> => isActionWithSuffix(action, 'request');

/**
 * Checks whether an action is a success lifecycle action.
 *
 * @template A - The action type.
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::success`.
 */
export const isSuccessAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'success'> => isActionWithSuffix(action, 'success');

/**
 * Checks whether an action is a failure lifecycle action.
 *
 * @template A - The action type.
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::failure`.
 */
export const isFailureAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'failure'> => isActionWithSuffix(action, 'failure');

/**
 * Checks whether an action is a successful or failed completion action.
 *
 * @template A - The action type.
 * @param action - The action to check.
 * @returns `true` if the action type ends with `::success` or `::failure`.
 */
export const isCompleteAction = <A extends AnyAction>(
  action: A,
): action is ActionWithSuffix<A, 'success' | 'failure'> =>
  isSuccessAction(action) || isFailureAction(action);

import { isFailureAction } from './is-failure-action';
import { isSuccessAction } from './is-success-action';

import type { ActionWithSuffix, AnyAction } from './types';

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
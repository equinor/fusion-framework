import { isActionWithSuffix } from './is-action-with-suffix';

import type { ActionWithSuffix, AnyAction } from './types';

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
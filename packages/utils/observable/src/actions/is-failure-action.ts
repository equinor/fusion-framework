import { isActionWithSuffix } from './is-action-with-suffix';

import type { ActionWithSuffix, AnyAction } from './types';

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
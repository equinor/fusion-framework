import { matchActionSuffix } from './match-action-suffix';

import type { Action, ActionWithSuffix } from './types';

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

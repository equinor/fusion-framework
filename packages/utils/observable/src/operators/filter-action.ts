import type { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import type { Action, ActionType, ExtractAction, TypeConstant } from '../types';

/**
 * RxJS operator that filters an action stream to only emit actions matching
 * one or more specified action types.
 *
 * @template TAction - The union of possible action types in the stream.
 * @template TType - The specific action type constant(s) to filter for.
 * @param types - One or more action type strings to filter by.
 * @returns An `OperatorFunction` that narrows the stream to matching actions.
 *
 * @example
 * ```ts
 * import { filterAction } from '@equinor/fusion-observable/operators';
 *
 * action$.pipe(
 *   filterAction('increment', 'decrement'),
 * ).subscribe((action) => {
 *   // action is narrowed to increment | decrement
 * });
 * ```
 */
export const filterAction = <
  TAction extends Action,
  TType extends TypeConstant = ActionType<TAction>,
>(
  ...types: TType[]
): OperatorFunction<TAction, ExtractAction<TAction, TType>> =>
  filter((x: TAction): x is ExtractAction<TAction, TType> => types.includes(x.type as TType));

export default filterAction;

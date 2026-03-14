import { type Observable, map, type OperatorFunction } from 'rxjs';
import { filterAction } from './filter-action';
import type { Action, ActionType, ExtractAction } from '../types';

/**
 * RxJS operator that filters an action stream by type and maps matching
 * actions to a new value.
 *
 * Combines {@link filterAction} and `map` into a single operator for concise
 * action-stream transformations.
 *
 * @template TAction - The union of possible action types in the stream.
 * @template TType - The specific action type to match.
 * @template TResult - The mapped output type.
 * @param type - The action type string to filter by.
 * @param fn - A mapping function applied to each matching action.
 * @returns An `OperatorFunction` that filters and maps the action stream.
 *
 * @example
 * ```ts
 * import { mapAction } from '@equinor/fusion-observable/operators';
 *
 * action$.pipe(
 *   mapAction('fetchSuccess', (action) => action.payload.data),
 * ).subscribe(console.log);
 * ```
 */
export const mapAction =
  <TAction extends Action, TType extends ActionType<TAction>, TResult>(
    type: TType,
    fn: (value: ExtractAction<TAction, TType>) => TResult,
  ): OperatorFunction<ExtractAction<TAction, TType>, TResult> =>
  (source: Observable<TAction>) =>
    source.pipe(filterAction(type), map(fn));

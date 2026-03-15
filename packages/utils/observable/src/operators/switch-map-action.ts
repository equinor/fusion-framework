import { type OperatorFunction, type ObservableInput, switchMap } from 'rxjs';
import { filterAction } from './filter-action';
import type { Action, ActionType, ExtractAction } from '../types';

/**
 * RxJS operator that filters an action stream by type and `switchMap`s
 * matching actions to an inner observable.
 *
 * Combines {@link filterAction} and `switchMap` into a single operator,
 * cancelling any previously active inner subscription when a new matching
 * action arrives.
 *
 * @template TAction - The union of possible action types in the stream.
 * @template TType - The specific action type to match.
 * @template TResult - The type emitted by the inner observable.
 * @param type - The action type string to filter by.
 * @param fn - A function that receives a matching action and returns an `ObservableInput`.
 * @returns An `OperatorFunction` that filters, then switch-maps the action stream.
 *
 * @example
 * ```ts
 * import { switchMapAction } from '@equinor/fusion-observable/operators';
 *
 * action$.pipe(
 *   switchMapAction('search', (action) => fetchResults(action.payload)),
 * ).subscribe(console.log);
 * ```
 */
export const switchMapAction =
  <TAction extends Action, TType extends ActionType<TAction>, TResult>(
    type: TType,
    fn: (value: ExtractAction<TAction, TType>) => ObservableInput<TResult>,
  ): OperatorFunction<TAction, TResult> =>
  (source) =>
    source.pipe(filterAction(type), switchMap(fn));

export default switchMapAction;

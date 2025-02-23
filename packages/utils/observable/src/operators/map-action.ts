import { type Observable, map, type OperatorFunction } from 'rxjs';
import { filterAction } from './filter-action';
import type { Action, ActionType, ExtractAction } from '../types';

export const mapAction =
  <TAction extends Action, TType extends ActionType<TAction>, TResult>(
    type: TType,
    fn: (value: ExtractAction<TAction, TType>) => TResult,
  ): OperatorFunction<ExtractAction<TAction, TType>, TResult> =>
  (source: Observable<TAction>) =>
    source.pipe(filterAction(type), map(fn));

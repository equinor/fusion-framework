import { OperatorFunction, ObservableInput, switchMap } from 'rxjs';
import { filterAction } from './filter-action';
import { Action, ActionType, ExtractAction } from '../types';

export const switchMapAction =
    <TAction extends Action, TType extends ActionType<TAction>, TResult>(
        type: TType,
        fn: (value: ExtractAction<TAction, TType>) => ObservableInput<TResult>
    ): OperatorFunction<TAction, TResult> =>
    (source) =>
        source.pipe(filterAction(type), switchMap(fn));

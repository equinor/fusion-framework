import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Action, ActionType, ExtractAction } from '../types';

export const filterAction = <TAction extends Action, TType extends ActionType<TAction>>(
    type: TType
): OperatorFunction<TAction, ExtractAction<TAction, TType>> =>
    filter((x: TAction): x is ExtractAction<TAction, TType> => x.type === type);

export default filterAction;

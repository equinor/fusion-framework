import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Action, ActionType, ExtractAction } from '../types';

export const filterAction = <TAction extends Action, TType extends ActionType<TAction>>(
    ...type: TType[]
): OperatorFunction<TAction, ExtractAction<TAction, TType>> =>
    filter((x: TAction): x is ExtractAction<TAction, TType> => type.includes(x.type as TType));

export default filterAction;

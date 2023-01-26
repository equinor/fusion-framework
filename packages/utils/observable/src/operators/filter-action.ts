import type { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Action, ActionType, ExtractAction, TypeConstant } from '../types';

export const filterAction = <
    TAction extends Action,
    TType extends TypeConstant = ActionType<TAction>
>(
    ...types: TType[]
): OperatorFunction<TAction, ExtractAction<TAction, TType>> =>
    filter((x: TAction): x is ExtractAction<TAction, TType> => types.includes(x.type as TType));

export default filterAction;

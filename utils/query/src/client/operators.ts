import type { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { QueryTaskCompleted, QueryTaskValue } from './types';

export const filterQueryTaskComplete = <TType, TArgs>(): OperatorFunction<
    QueryTaskValue,
    QueryTaskCompleted<TType, TArgs>
> => filter((x): x is QueryTaskCompleted<TType, TArgs> => x.status === 'complete');

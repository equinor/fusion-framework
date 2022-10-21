import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActionPayload, ReactiveObservable } from '../..';

import { createReducer } from './create-reducer';
import type { QueryCacheActions, QueryCacheActionTypes } from './actions';
import type { QueryCacheRecord, QueryCacheState, QueryCacheStateData } from './types';

const getLastTransaction = <TType, TArgs>(
    state: QueryCacheState<TType, TArgs>
): QueryCacheRecord<TType, TArgs> | undefined => {
    const transaction = state.lastTransaction;
    if (transaction) {
        return Object.values(state.data).find((x) => x.transaction === transaction);
    }
};

export type QueryCacheCtorArgs<TType, TArgs> = {
    initial?: QueryCacheStateData<TType, TArgs>;
    trimming?: ActionPayload<QueryCacheActions<TType, TArgs>['trim']>;
};

export class QueryCache<TType, TArgs> extends ReactiveObservable<
    QueryCacheState<TType, TArgs>,
    QueryCacheActionTypes<TType, TArgs>
> {
    get data$(): Observable<Record<string, QueryCacheRecord<TType, TArgs>>> {
        return this.pipe(map((x) => x.data));
    }

    get latest(): QueryCacheRecord<TType, TArgs> | undefined {
        return getLastTransaction(this.value);
    }

    constructor(args: QueryCacheCtorArgs<TType, TArgs>) {
        const { trimming, initial } = args;
        super(createReducer(), { data: initial ?? {} });
        if (trimming) {
            this.addEffect('set', () => this.trim(trimming));
        }
    }

    public setItem(
        key: string,
        value: Omit<QueryCacheRecord<TType, TArgs>, 'updates' | 'created'>
    ) {
        this.next({
            type: 'set',
            payload: {
                key,
                value,
            },
        });
    }

    public getItem(key: string): QueryCacheRecord<TType, TArgs> | undefined {
        return this.value.data[key];
    }

    public invalidate(key: string) {
        this.next({ type: 'invalidate', payload: { key } });
    }

    public trim(options: ActionPayload<QueryCacheActions<TType, TArgs>['trim']>) {
        this.next({ type: 'trim', payload: options });
    }
}

export default QueryCache;

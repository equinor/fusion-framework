import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActionPayloadType, FlowSubject } from '@equinor/fusion-observable';

import { createReducer } from './create-reducer';
import type { QueryCacheActions, QueryCacheActionTypes } from './actions';
import type { QueryCacheRecord, QueryCacheState, QueryCacheStateData } from './types';

const getLastTransaction = <TType, TArgs>(
    state: QueryCacheState<TType, TArgs>
): QueryCacheRecord<TType, TArgs> | undefined => {
    const transaction = state.lastTransaction;
    const items = Object.values(state.data);
    if (transaction) {
        return items.find((x) => x.transaction === transaction);
    }
    return items.sort((a, b) => (a.updated ?? 0) - (b.updated ?? 0)).pop();
};

export type QueryCacheCtorArgs<TType, TArgs> = {
    initial?: QueryCacheStateData<TType, TArgs>;
    trimming?: ActionPayloadType<QueryCacheActions<TType, TArgs>['trim']>;
};

export class QueryCache<TType, TArgs> extends FlowSubject<
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

    public trim(options: ActionPayloadType<QueryCacheActions<TType, TArgs>['trim']>) {
        this.next({ type: 'trim', payload: options });
    }
}

export default QueryCache;

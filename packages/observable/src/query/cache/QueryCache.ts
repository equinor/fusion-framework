import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReactiveObservable } from '../..';

import { QueryClient } from '../client';

// TODO
// import { Query } from '..';
// import { ActionTypes } from '../actions';

import { createReducer } from './create-reducer';
import type { QueryCacheActionTypes } from './actions';
import type { QueryCacheRecord, QueryCacheState, QueryCacheStateData } from './types';

export type QueryCacheOptions<TType, TArgs> = {
    initial?: QueryCacheStateData<TType, TArgs>;
    KeyBuilder: (query: TArgs) => string;
};

export class QueryCache<TType, TArgs> extends ReactiveObservable<
    QueryCacheState<TType, TArgs>,
    QueryCacheActionTypes<TType, TArgs>
> {
    #subscription = new Subscription();

    get data$(): Observable<Record<string, QueryCacheRecord<TType, TArgs>>> {
        return this.pipe(map((x) => x.data));
    }

    get latest(): QueryCacheRecord<TType, TArgs> | undefined {
        const transaction = this.value.lastTransaction;
        if (transaction) {
            return Object.values(this.value.data).find((x) => x.transaction === transaction);
        }
    }

    constructor(query: QueryClient<TType, TArgs>, options: QueryCacheOptions<TType, TArgs>) {
        super(createReducer(), { data: options.initial ?? {} });

        /** when the client successfully executed an query */
        query.on('success', (action) => {
            const {
                payload: value,
                meta: { request },
            } = action;
            this.#subscription.add(
                /** request to store cache entry */
                this.next({
                    type: 'set',
                    payload: {
                        key: options.KeyBuilder(request.payload),
                        value: {
                            value,
                            created: Date.now(),
                            args: request.payload,
                            transaction: request.meta.transaction,
                        },
                    },
                })
            );
        });

        this.#subscription.add(
            /** when refresh is requested, dispatch query for cache entry */
            this.addEffect('refresh', (action) => {
                const entry = this.getItem(action.payload.key);
                if (entry) {
                    query.next(entry.args);
                }
            })
        );
    }

    public getItem(key: string): QueryCacheRecord<TType, TArgs> | undefined {
        return this.value.data[key];
    }

    public invalidate(key: string) {
        this.next({ type: 'invalidate', payload: { key } });
    }

    public refresh(key: string) {
        this.next({ type: 'refresh', payload: { key } });
    }

    public complete() {
        super.complete();
        this.#subscription.unsubscribe();
    }
}

export default QueryCache;

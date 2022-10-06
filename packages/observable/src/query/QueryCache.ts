import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ActionType } from './actions';
import { Query } from './Query';

export type QueryCacheState<TType, TArgs> = {
    data: TType | undefined;
    args?: TArgs;
    transaction?: string;
    ref?: string;
    updated?: number;
    updates: number;
};

export class QueryCache<TType, TArgs> extends Observable<QueryCacheState<TType, TArgs>> {
    private __state$!: BehaviorSubject<QueryCacheState<TType, TArgs>>;
    private __subscription = new Subscription();
    constructor(client: Query<TType, TArgs>, initial?: TType) {
        super((subscriber) => {
            return this.__state$.subscribe(subscriber);
        });
        this.__state$ = new BehaviorSubject({ data: initial, updates: 0 });
        this.__subscription.add(() => this.__state$.complete());
        this.__subscription.add(
            client.on(ActionType.SUCCESS, (action) => {
                if (!this.__state$.closed) {
                    this.__state$.next({
                        data: action.payload,
                        args: action.meta.request.payload,
                        ref: action.meta.request.meta.ref,
                        transaction: action.meta.request.transaction,
                        updated: Date.now(),
                        updates: this.__state$.value.updates + 1,
                    });
                }
            })
        );
    }

    public get value(): QueryCacheState<TType, TArgs> {
        return this.__state$.value;
    }

    public get data(): TType | undefined {
        return this.value.data;
    }

    public complete() {
        this.__subscription.unsubscribe();
    }

    public asObservable() {
        return this.__state$.asObservable();
    }
}

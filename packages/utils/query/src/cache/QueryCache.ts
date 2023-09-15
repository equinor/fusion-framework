import { Observable } from 'rxjs';

import { FlowSubject } from '@equinor/fusion-observable';

import { actions } from './actions';

import createReducer from './create-reducer';

import type { QueryCacheRecord, QueryCacheStateData } from './types';
import type { ActionMap, Actions } from './actions';

type TrimOptions<TType, TArgs> = ActionMap<TType, TArgs>['trim']['payload'];

export type QueryCacheCtorArgs<TType, TArgs> = {
    initial?: QueryCacheStateData<TType, TArgs>;
    trimming?: TrimOptions<TType, TArgs>;
};

export class QueryCache<TType, TArgs> {
    #state: FlowSubject<QueryCacheStateData<TType, TArgs>, Actions<TType, TArgs>>;

    get state(): Record<string, QueryCacheRecord<TType, TArgs>> {
        return this.#state.value;
    }

    get state$(): Observable<Record<string, QueryCacheRecord<TType, TArgs>>> {
        return this.#state.asObservable();
    }

    constructor(args?: QueryCacheCtorArgs<TType, TArgs>) {
        const { trimming, initial } = args ?? {};

        this.#state = new FlowSubject(createReducer(actions, initial));
        if (trimming) {
            this.#state.addEffect('cache/set', () => this.#state.next(actions.trim(trimming)));
        }
    }

    public setItem(...args: Parameters<typeof actions.set>) {
        this.#state.next(actions.set(...args));
    }

    public getItem(key: string): QueryCacheRecord<TType, TArgs> | undefined {
        return this.#state.value[key];
    }

    public removeItem(key: string) {
        this.#state.next(actions.remove(key));
    }

    public invalidate(key: string) {
        this.#state.next(actions.invalidate(key));
    }

    public trim(options: TrimOptions<TType, TArgs>) {
        this.#state.next(actions.trim(options));
    }

    public reset() {
        this.#state.reset();
    }

    public complete() {
        this.#state.complete();
    }
}

export default QueryCache;

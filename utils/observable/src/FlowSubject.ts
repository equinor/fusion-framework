import { Reducer } from 'react';
import {
    asyncScheduler,
    BehaviorSubject,
    EMPTY,
    from,
    Observable,
    Subject,
    Subscription,
} from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    filter,
    mergeMap,
    observeOn,
    scan,
} from 'rxjs/operators';
import { filterAction } from './operators';

import type { Action, ActionType, ExtractAction } from './types/actions';
import type { Flow, Effect } from './types/flow';
import type { ReducerWithInitialState } from './types/reducers';

/**
 * Observable that mutates by dispatching actions and internally sequentially reduced.
 */
export class FlowSubject<S, A extends Action = Action> extends Observable<S> {
    /**
     * return state to initial
     */
    public reset: VoidFunction;

    #action = new Subject<A>();
    #state: BehaviorSubject<S>;

    /**
     * Observable stream of actions dispatched to the subject
     */
    get action$(): Observable<A> {
        return this.#action.asObservable();
    }

    /**
     * current value of state
     */
    get value(): S {
        return this.#state.value;
    }

    /**
     * flag to indicate of the observable is closed
     */
    get closed(): boolean {
        return this.#state.closed || this.#action.closed;
    }

    constructor(reducer: ReducerWithInitialState<S, A>);
    constructor(reducer: Reducer<S, A>, initialState: S);

    constructor(reducer: ReducerWithInitialState<S, A> | Reducer<S, A>, initialState?: S) {
        super((subscriber) => {
            return this.#state.subscribe(subscriber);
        });
        const initial =
            'getInitialState' in reducer ? reducer.getInitialState() : (initialState as S);
        this.#state = new BehaviorSubject(initial);
        this.#action.pipe(scan(reducer, initial), distinctUntilChanged()).subscribe(this.#state);
        this.reset = () => this.#state.next(initial);
    }

    /** Dispatch action */
    public next(action: A): void {
        this.#action.next(action);
    }

    public addEffect(fn: Effect<A, S>): Subscription;
    public addEffect<TType extends ActionType<A>>(
        actionType: TType,
        cb: Effect<ExtractAction<A, TType>, S>
    ): Subscription;

    /**
     * observe dispatch of an action type
     *
     * @note side-effect cannot alter state, nor be sync
     * @note unsubscribe when done
     * @param actionType - type of action to observe
     * @param fn - callback when action is dispatch
     */
    public addEffect<TType extends ActionType<A>>(
        actionTypeOrFn: TType | Effect<A, S>,
        fn?: Effect<ExtractAction<A, TType>, S>
    ): Subscription {
        const action$ =
            typeof actionTypeOrFn === 'string'
                ? this.action$.pipe(filterAction(actionTypeOrFn))
                : this.action$;
        const mapper = (fn ? fn : actionTypeOrFn) as Effect<A, S>;
        return action$
            .pipe(
                mergeMap((action) =>
                    from(
                        new Promise((resolve, reject) => {
                            try {
                                resolve(mapper(action, this.value));
                            } catch (err) {
                                reject(err);
                            }
                        })
                    ).pipe(
                        catchError((err) => {
                            console.warn('unhandled effect', err);
                            return EMPTY;
                        })
                    )
                ),
                filter((x): x is A => !!x),
                observeOn(asyncScheduler)
            )
            .subscribe(this.#action);
    }

    /** @deprecated use `addFlow`*/
    public addEpic(fn: Flow<A, S>): Subscription {
        return this.addFlow(fn);
    }

    public addFlow(fn: Flow<A, S>): Subscription {
        const epic$ = fn(this.action$, this);
        if (!epic$) {
            throw new TypeError(
                `addEpic: one of the provided effects "${
                    fn.name || '<anonymous>'
                }" does not return a stream. Double check you're not missing a return statement!`
            );
        }
        return epic$
            .pipe(
                catchError((err) => {
                    console.trace('unhandled exception, epic closed!', err);
                    return EMPTY;
                }),
                observeOn(asyncScheduler)
            )
            .subscribe(this.#action);
    }

    /**
     * unsubscribes to actions, removes subscribers
     */
    public unsubscribe() {
        this.#action.unsubscribe();
        this.#state.unsubscribe();
    }

    /**
     * finalizes the subject, completes observers
     */
    public complete() {
        this.#action.complete();
        this.#state.complete();
    }

    /**
     * clone to simple observable
     */
    public asObservable() {
        return this.#state.asObservable();
    }
}

export default FlowSubject;

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
 * A specialized Observable that maintains internal state, which can be mutated by dispatching actions.
 * Actions are processed sequentially by a reducer function to produce new state values.
 * This class extends from Observable to allow subscribers to react to state changes over time.
 */
export class FlowSubject<S, A extends Action = Action> extends Observable<S> {
    /**
     * The internal subject for actions.
     * @private
     */
    #action = new Subject<A>();

    /**
     * The internal behavior subject for state management.
     * @private
     */
    #state: BehaviorSubject<S>;

    /**
     * Observable stream of actions dispatched to the subject.
     */
    get action$(): Observable<A> {
        return this.#action.asObservable();
    }

    /**
     * The current value of state.
     */
    get value(): S {
        return this.#state.value;
    }

    /**
     * Flag to indicate if the observable is closed.
     */
    get closed(): boolean {
        return this.#state.closed || this.#action.closed;
    }

    /**
     * Initializes a new instance of the FlowSubject class.
     *
     * @param reducer A reducer with an initial state or a reducer function.
     * @param initialState The initial state of the subject.
     */
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

    /**
     * Resets the state to the initial value.
     */
    public reset: VoidFunction;

    /**
     * Dispatches an action to the subject.
     *
     * @param action The action to dispatch.
     */
    public next(action: A): void {
        this.#action.next(action);
    }

    /**
     * Adds an effect that listens for actions and performs side effects.
     *
     * @param fn The effect function to execute.
     * @returns A subscription to the effect.
     */
    public addEffect(fn: Effect<A, S>): Subscription;

    /**
     * Adds an effect that listens for a specific action type and performs side effects.
     *
     * @param actionType The type of action to listen for.
     * @param cb The effect function to execute when the action is dispatched.
     * @returns A subscription to the effect.
     */
    public addEffect<TType extends ActionType<A>>(
        actionType: TType,
        cb: Effect<ExtractAction<A, NoInfer<TType>>, S>,
    ): Subscription;

    /**
     * Adds an effect that listens for an array of action types and performs side effects.
     *
     * @param actionType The array of action types to listen for.
     * @param cb The effect function to execute when one of the actions is dispatched.
     * @returns A subscription to the effect.
     */
    public addEffect<TType extends ActionType<A>>(
        actionType: Array<TType>,
        cb: Effect<ExtractAction<A, NoInfer<TType>>, S>,
    ): Subscription;

    /**
     * Adds an effect that listens for actions and performs side effects.
     *
     * @param actionTypeOrFn The type of action to listen for, an array of action types, or the effect function itself.
     * @param fn The effect function to execute when the action is dispatched, if the first parameter is an action type.
     * @returns A subscription to the effect.
     */
    public addEffect<TType extends ActionType<A>>(
        actionTypeOrFn: TType | Array<TType> | Effect<A, S>,
        fn?: Effect<ExtractAction<A, NoInfer<TType>>, S>,
    ): Subscription {
        const action$ =
            typeof actionTypeOrFn === 'function'
                ? this.action$
                : Array.isArray(actionTypeOrFn)
                  ? this.action$.pipe(filterAction(...actionTypeOrFn))
                  : this.action$.pipe(filterAction(actionTypeOrFn));

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
                        }),
                    ).pipe(
                        catchError((err) => {
                            console.warn('unhandled effect', err);
                            return EMPTY;
                        }),
                    ),
                ),
                filter((x): x is A => !!x),
                observeOn(asyncScheduler),
            )
            .subscribe(this.#action);
    }

    /**
     * Deprecated. Use `addFlow` instead.
     *
     * @deprecated use `addFlow`
     *
     * @param fn The flow function to execute.
     * @returns A subscription to the flow.
     */
    public addEpic(fn: Flow<A, S>): Subscription {
        return this.addFlow(fn);
    }

    /**
     * Adds a flow that listens for actions and performs side effects.
     *
     * @param fn The flow function to execute.
     * @returns A subscription to the flow.
     */
    public addFlow(fn: Flow<A, S>): Subscription {
        const epic$ = fn(this.action$, this);
        if (!epic$) {
            throw new TypeError(
                `addEpic: one of the provided effects "${
                    fn.name || '<anonymous>'
                }" does not return a stream. Double check you're not missing a return statement!`,
            );
        }
        return epic$
            .pipe(
                catchError((err) => {
                    console.trace('unhandled exception, epic closed!', err);
                    return EMPTY;
                }),
                observeOn(asyncScheduler),
            )
            .subscribe(this.#action);
    }

    /**
     * Unsubscribes from actions and removes subscribers.
     */
    public unsubscribe() {
        this.#action.unsubscribe();
        this.#state.unsubscribe();
    }

    /**
     * Finalizes the subject and completes observers.
     */
    public complete() {
        this.#action.complete();
        this.#state.complete();
    }

    /**
     * Clones the subject to a simple observable.
     *
     * @returns An observable of the state.
     */
    public asObservable() {
        return this.#state.asObservable();
    }
}

export default FlowSubject;

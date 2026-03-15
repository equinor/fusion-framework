import type { Reducer } from 'react';
import {
  asyncScheduler,
  BehaviorSubject,
  EMPTY,
  from,
  Observable,
  Subject,
  type Subscription,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  observeOn,
  scan,
} from 'rxjs/operators';
import { filterAction } from './operators';

import type { Action, ActionType, ExtractAction } from './types/actions';
import type { Flow, Effect } from './types/flow';
import type { ReducerWithInitialState } from './types/reducers';

/**
 * A specialized Observable that maintains internal state mutated by dispatching actions.
 *
 * Actions are processed sequentially by a reducer function to produce new state values.
 * Extends `Observable` so subscribers react to state changes over time.
 *
 * Inspired by Redux-style state management but built on top of RxJS, `FlowSubject`
 * combines a `BehaviorSubject` for state with a `Subject` for actions, providing
 * a reactive, observable state container.
 *
 * @template S - The state type managed by this subject.
 * @template A - The action type dispatched to this subject.
 *
 * @example
 * ```ts
 * import { FlowSubject, createReducer } from '@equinor/fusion-observable';
 *
 * type State = { count: number };
 * type Action = { type: 'increment' } | { type: 'decrement' };
 *
 * const reducer = createReducer<State, Action>({ count: 0 }, (builder) =>
 *   builder
 *     .addCase('increment', (state) => { state.count += 1; })
 *     .addCase('decrement', (state) => { state.count -= 1; }),
 * );
 *
 * const subject = new FlowSubject(reducer);
 * subject.subscribe((state) => console.log(state.count));
 * subject.next({ type: 'increment' }); // logs: 1
 * ```
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
   * Creates a new instance of the FlowSubject class with an initial state reducer.
   * @param reducer A reducer with an initial state or a reducer function.
   */
  constructor(reducer: ReducerWithInitialState<S, A>);

  /**
   * Create a new instance of the FlowSubject class with a reducer function and initial state.
   * @param reducer state reducer
   * @param initialState initial state
   */
  constructor(reducer: Reducer<S, A>, initialState: S);

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
    const initial = 'getInitialState' in reducer ? reducer.getInitialState() : (initialState as S);
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
   * Selects a derived state from the observable state and emits only when the selected state changes.
   *
   * @param selector - A function that takes the current state and returns a derived state.
   * @param comparator - An optional function that compares the previous and current derived states to determine if a change has occurred.
   * @returns An observable that emits the derived state whenever it changes.
   */
  public select<T>(
    selector: (state: S) => T,
    comparator?: (previous: T, current: T) => boolean,
  ): Observable<T> {
    return this.#state.pipe(map(selector), distinctUntilChanged(comparator));
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
   * @deprecated Use {@link FlowSubject.addFlow} instead.
   *
   * @param fn - The flow function to execute.
   * @returns A subscription to the flow.
   */
  public addEpic(fn: Flow<A, S>): Subscription {
    return this.addFlow(fn);
  }

  /**
   * Adds a flow (epic-style) that transforms the action stream and optionally
   * reads state, then emits new actions back into the subject.
   *
   * Flows receive the full `action$` stream and the state observable, and must
   * return an `Observable<A>`. This is useful for complex async orchestration.
   *
   * @param fn - The flow function that receives `(action$, state$)` and returns an action observable.
   * @returns A subscription to the flow. Unsubscribe to remove the flow.
   * @throws {TypeError} If the flow function does not return an observable.
   *
   * @example
   * ```ts
   * subject.addFlow((action$) =>
   *   action$.pipe(
   *     filterAction('fetchData'),
   *     switchMap((action) =>
   *       fetchApi(action.payload).pipe(
   *         map((data) => ({ type: 'fetchSuccess', payload: data })),
   *       ),
   *     ),
   *   ),
   * );
   * ```
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
   * Tears down the subject by unsubscribing both the action and state subjects.
   *
   * After calling this method, the subject is no longer usable.
   */
  public unsubscribe() {
    this.#action.unsubscribe();
    this.#state.unsubscribe();
  }

  /**
   * Completes both the action and state subjects, signalling to all
   * subscribers that no further values will be emitted.
   */
  public complete() {
    this.#action.complete();
    this.#state.complete();
  }

  /**
   * Returns a plain `Observable` of the state, hiding the subject's
   * `next`, `complete`, and other mutation methods.
   *
   * @returns A read-only observable of the state.
   */
  public asObservable() {
    return this.#state.asObservable();
  }
}

export default FlowSubject;

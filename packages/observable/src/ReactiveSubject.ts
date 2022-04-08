import {
    asyncScheduler,
    BehaviorSubject,
    EMPTY,
    from,
    Observable,
    Observer,
    Subject,
    Subscriber,
    Subscription,
    SubscriptionLike,
} from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, mergeMap, observeOn } from 'rxjs/operators';
import { Effect } from '.';

import { filterAction } from './operators';
import { Action, ActionType, Epic, ExtractAction, Reducer } from './types';

/**
 * Observable that mutates by dispatching actions and internally sequentially reduced.
 *
 */
export class ReactiveSubject<S, A extends Action = Action>
    extends Observable<S>
    implements SubscriptionLike
{
    private __state$: BehaviorSubject<S>;
    private __action$ = new Subject<A>();
    private __observers: Observer<S>[] = [];
    private __closed = false;

    /** check if subject is closed (will not emit or process if closed)  */
    get closed(): boolean {
        return this.__closed;
    }

    /** get current state of the subject */
    get value(): S {
        return this.__state$.value;
    }

    /** observable actions  */
    get action$(): Observable<A> {
        return this.__action$.asObservable();
    }

    constructor(reducer: Reducer<S, A>, initial: S) {
        super();
        /** create a state-full observer of state */
        this.__state$ = new BehaviorSubject<S>(initial);

        /** publish changes from state to observers of instance */
        this.__state$.subscribe((value) => {
            this.__observers.forEach((observer) => observer.next(value));
        });

        /** observer dispatch of action and mutate state */
        this.__action$
            .pipe(
                map((action) => reducer(this.__state$.value, action)),
                distinctUntilChanged()
            )
            .subscribe(this.__state$);
    }

    /** remove all subscribers  */
    public unsubscribe() {
        this.__state$.unsubscribe();
        this.__action$.unsubscribe();
        this.__observers = [];
    }

    /** Dispatch action */
    public dispatch(action: A): void {
        if (!this.__action$.closed) {
            this.__action$.next(action);
        }
    }

    public addEffect<TType extends ActionType<A>>(
        actionType: TType,
        fn: Effect<ExtractAction<A, TType>, S>
    ): Subscription;

    public addEffect(fn: Effect<A, S>): Subscription;

    public addEffect<TType extends ActionType<A>>(
        actionTypeOrFn: TType | Effect<A, S>,
        fn?: Effect<ExtractAction<A, TType>, S>
    ): Subscription {
        const action$ =
            typeof actionTypeOrFn === 'string'
                ? this.action$.pipe(filterAction(actionTypeOrFn))
                : this.action$;
        const mapper = (fn ? fn : actionTypeOrFn) as Effect<A, S>;
        return (action$ ?? this.__action$)
            .pipe(
                mergeMap((action) =>
                    from(mapper(action, this.value)).pipe(
                        catchError((err) => {
                            console.warn('unhandled effect', err);
                            return EMPTY;
                        })
                    )
                ),
                filter((x): x is A => !!x),
                observeOn(asyncScheduler)
            )
            .subscribe(this.__action$);
    }

    public addEpic(fn: Epic<A, S>): Subscription {
        const epic$ = fn(this.action$, this.asObservable());
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
            .subscribe(this.__action$);
    }

    public complete() {
        if (!this.__closed) {
            this.__closed = true;
            this.__observers.forEach((x) => x.complete());
            this.__action$.complete();
            this.__state$.complete();
        }
    }

    public error(err: unknown) {
        if (!this.__closed) {
            this.__observers.forEach((x) => x.error(err));
        }
    }

    /**
     * Creates a new Observable with this Subject as the source. You can do this
     * to create customize Observer-side logic of the Subject and conceal it from
     * code that uses the Observable.
     * @return {Observable} Observable that the Subject casts to
     */
    public asObservable(): Observable<S> {
        return new Observable<S>(this.subscribe);
    }

    /** @internal */
    protected _subscribe(subscriber: Subscriber<S>): Subscription {
        if (this.closed) {
            throw Error('can not subscribe to closed stream!');
        }
        this.__observers?.push(subscriber);
        return new Subscription(() => {
            this.__observers?.filter((x) => x !== subscriber);
        });
    }
}

export default ReactiveSubject;

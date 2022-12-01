import { useLayoutEffect, useState } from 'react';
import { ReactiveObservable } from '../ReactiveObservable';
import { Action, Effect, ActionType, ExtractAction } from '../types';

export interface useObservableEffect<
    S,
    A extends Action = Action,
    TType extends ActionType<A> = ActionType<A>
> {
    (
        subject: ReactiveObservable<S, A>,
        type: TType,
        effect?: Effect<ExtractAction<A, TType>, S>
    ): void;
}

export interface useObservableEffect<S, A extends Action = Action> {
    (subject: ReactiveObservable<S, A>, effect: Effect<A, S>): void;
}
/**
 * Apply side effect to Reactive Subject.
 *
 * __IMPORTANT__ observable returned from epics must return new action or will create infinite loop
 */
export const useObservableEffect = <
    S,
    A extends Action = Action,
    TType extends ActionType<A> = ActionType<A>
>(
    subject: ReactiveObservable<S, A>,
    effectOrType: Effect<A, S> | TType,
    effect?: Effect<ExtractAction<A, TType>, S>
): void => {
    const [type] = useState(() => (typeof effectOrType === 'string' ? effectOrType : undefined));
    const [fn] = useState(() => effect ?? effectOrType);
    useLayoutEffect(() => {
        const subscription = type
            ? subject.addEffect(type, fn as Effect<ExtractAction<A, TType>, S>)
            : subject.addEffect(fn as Effect<A, S>);
        return () => subscription.unsubscribe();
    }, [subject, type, fn]);
};

export default useObservableEffect;

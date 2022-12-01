import { useLayoutEffect } from 'react';
import { ReactiveObservable } from '../ReactiveObservable';
import { Action, Epic } from '../types';
/**
 * Apply side effect to Reactive Subject.
 *
 * __IMPORTANT__ observable returned from epics must return new action or will create infinite loop
 */
export const useObservableEpic = <S, A extends Action = Action>(
    subject: ReactiveObservable<S, A>,
    epic: Epic<A, S>
): void => {
    useLayoutEffect(() => {
        const subscription = subject.addEpic(epic);
        return () => subscription.unsubscribe();
    }, [subject, epic]);
};

export default useObservableEpic;

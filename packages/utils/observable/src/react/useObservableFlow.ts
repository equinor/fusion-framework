import { useLayoutEffect } from 'react';
import { FlowSubject } from '../FlowSubject';
import { Action, Flow } from '../types';
/**
 * Apply side effect to Reactive Subject.
 *
 * __IMPORTANT__ observable returned from flow must return new action or will create infinite loop
 */
export const useObservableFlow = <S, A extends Action = Action>(
    subject: FlowSubject<S, A>,
    epic: Flow<A, S>
): void => {
    useLayoutEffect(() => {
        const subscription = subject.addFlow(epic);
        return () => subscription.unsubscribe();
    }, [subject, epic]);
};

/** @deprecated since 8.0.3 renamed to useObservableFlow */
export const useObservableEpic = useObservableFlow;

export default useObservableFlow;

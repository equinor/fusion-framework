import { useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Observable } from '../types';
import { useObservableLayoutSubscription } from './useObservableSubscription';

/**
 * Hook for extracting state of observable.
 * **note** when state changes the consumer of the hook will rerender
 *
 * @param subject Observable subject
 * @param initial initial value
 * @returns current state of observable
 */
export const useObservableState = <S>(subject: Observable<S>, initial?: S): S | undefined => {
    initial ??= (subject as BehaviorSubject<S>).value;
    const [state, setState] = useState<S | undefined>(initial);
    useObservableLayoutSubscription(subject, setState);
    return state;
};

export default useObservableState;

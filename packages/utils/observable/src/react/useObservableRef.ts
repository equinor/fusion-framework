import { useCallback, useRef } from 'react';
import { BehaviorSubject } from 'rxjs';
import { useObservableLayoutSubscription } from './useObservableSubscription';
import { Observable } from '../types';

/**
 * TODO
 */
export const useObservableRef = <S>(
    subject: Observable<S>,
    initial?: S,
): React.RefObject<S | undefined> => {
    initial ??= (subject as BehaviorSubject<S>).value;
    const ref = useRef<S | undefined>(initial);
    useObservableLayoutSubscription(
        subject,
        useCallback((x: S) => (ref.current = x), []),
    );
    return ref;
};

export default useObservableRef;

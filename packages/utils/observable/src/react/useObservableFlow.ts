import { useLayoutEffect } from 'react';
import type { FlowSubject } from '../FlowSubject';
import type { Action, Flow } from '../types';
/**
 * React hook that attaches a flow (epic-style function) to a {@link FlowSubject}.
 *
 * The flow receives the action stream and state observable, and must return an
 * observable of new actions. The subscription is managed by the hook lifecycle.
 *
 * **Important:** The observable returned from the flow must emit new actions.
 * Returning the same action will cause an infinite loop.
 *
 * @template S - The state type.
 * @template A - The action type.
 * @param subject - The `FlowSubject` to attach the flow to.
 * @param epic - A flow function `(action$, state$) => Observable<Action>`.
 *
 * @example
 * ```tsx
 * useObservableFlow(subject, (action$) =>
 *   action$.pipe(
 *     filterAction('search'),
 *     debounceTime(300),
 *     switchMap((a) => fetchResults(a.payload).pipe(
 *       map((res) => ({ type: 'searchResult', payload: res })),
 *     )),
 *   ),
 * );
 * ```
 */
export const useObservableFlow = <S, A extends Action = Action>(
  subject: FlowSubject<S, A>,
  epic: Flow<A, S>,
): void => {
  useLayoutEffect(() => {
    const subscription = subject.addFlow(epic);
    return () => subscription.unsubscribe();
  }, [subject, epic]);
};

/** @deprecated Renamed to {@link useObservableFlow} since 8.0.3. */
export const useObservableEpic = useObservableFlow;

export default useObservableFlow;

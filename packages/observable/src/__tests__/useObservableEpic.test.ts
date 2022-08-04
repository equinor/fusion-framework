import { renderHook, act } from '@testing-library/react-hooks';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { useObservableEpic } from '../react';

import { ReactiveObservable } from '../ReactiveObservable';
import { Epic, Reducer } from '../types';

type State = { value: string; index: number };
type Action = { type: string; payload: string };

describe('useObservableEpic', () => {
    it('should work', (complete) => {
        const initial: State = { value: 'initial', index: 0 };
        const reducer: Reducer<State, Action> = (state, action) => {
            return { value: action.payload, index: state.index + 1 };
        };
        const action1: Action = { type: 'FOO', payload: 'foo' };
        const action2: Action = { type: 'BAR', payload: 'bar' };

        const subject = new ReactiveObservable(reducer, initial);

        /** check that initial state is correct */
        expect(subject.value).toEqual(initial);

        /** assert state when second action is sent to subject */
        subject.addEffect(action2.type, (action, state) => {
            expect(action).toEqual(action2);
            expect(state.index).toBe(2);
            expect(state.value).toEqual(action2.payload);
            /** close subject, end of test */
            subject.complete();
        });

        /** complete test when subject closes */
        subject.subscribe({ complete });

        /** create and epic that triggers when action1 is called */
        const epic$: Epic<Action, State> = (action$, state$) => {
            return action$.pipe(
                filter((x) => x.type === action1.type),
                /** include value from latest state in subject */
                withLatestFrom(state$),
                tap(([action, state]) => {
                    expect(action).toEqual(action1);
                    expect(state.index).toEqual(1);
                    expect(state.value).toEqual(action1.payload);
                }),
                /** return action2 for dispatch in subject */
                map(() => action2)
            );
        };

        /** wire up hook */
        renderHook(() => useObservableEpic(subject, epic$));

        /** trigger subject by dispatching action1 */
        act(() => subject.next(action1));

        /** make sure all assertions are executed */
        expect.assertions(7);
    });
});

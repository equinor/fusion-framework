import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { ReactiveObservable } from '../ReactiveObservable';

type State = { value: string; index: number };
type Action = { type: string; payload: string };
const createTest = (initial: string) => {
    const subject = new ReactiveObservable<State, Action>(
        (state, action) => {
            return { value: action.payload, index: state.index + 1 };
        },
        { value: initial, index: 0 }
    );
    return subject;
};

describe('Reactive observable', () => {
    it('should allow to subscribe', (done) => {
        const expected = ['initial', 'test'];
        const subject = createTest(expected[0]);
        subject.subscribe({
            next: (next) => {
                expect(next.value).toEqual(expected[next.index]);
            },
            complete: () => {
                expect.assertions(expected.length);
                done();
            },
        });
        subject.next({ type: 'test', payload: expected[1] });
        subject.complete();
    });

    it('should allow multiple subscriptions', (done) => {
        const expected = ['initial', 'test'];
        const subject = createTest(expected[0]);
        const assert = (state: State) => expect(state.value).toEqual(expected[state.index]);
        subject.subscribe(assert);
        subject.subscribe(assert);
        subject.subscribe(assert);
        subject.subscribe({
            complete: () => {
                expect.assertions(expected.length * 3);
                done();
            },
        });
        subject.next({ type: 'test', payload: expected[1] });
        subject.complete();
    });

    it('should handle side effects', (done) => {
        const expectedValues = ['initial', 'dispatched', 'effect'];

        const expectedActions = [
            { type: 'dispatch', payload: expectedValues[1] },
            { type: 'effect', payload: expectedValues[2] },
        ];

        const assertState = (state: State) =>
            expect(state.value).toEqual(expectedValues[state.index]);

        const subject = createTest(expectedValues[0]);
        subject.subscribe({
            next: (state) => {
                assertState(state);
            },
            complete: () => {
                done();
            },
        });

        subject.addEpic((action$, state$) => {
            return action$.pipe(
                filter((x) => x === expectedActions[0]),
                withLatestFrom(state$),
                tap(([action, state]) => {
                    expect(action).toEqual(expectedActions[0]);
                    assertState(state);
                }),
                map(() => expectedActions[1])
            );
        });

        subject.addEffect('effect', () => {
            subject.complete();
        });

        subject.next(expectedActions[0]);
    });
});

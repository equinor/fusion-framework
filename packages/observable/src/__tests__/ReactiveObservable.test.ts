import { Observable, throwError } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { ReactiveObservable } from '../ReactiveObservable';
import { Epic } from '../types';

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

    it('should unsubscribe', (complete) => {
        const expected = ['initial', 'test1', 'test2'];
        const subject = createTest(expected[0]);
        const cache: State[] = [];
        subject.subscribe((x) => cache.push(x));
        expect(cache).toHaveLength(1);
        subject.next({ type: 'test', payload: expected[1] });
        expect(cache).toHaveLength(2);
        subject.unsubscribe();
        try {
            subject.next({ type: 'test', payload: expected[2] });
        } catch (err) {
            expect(err).toBeInstanceOf(Error);
            complete();
        }
    });

    it('should failed to add invalid epic', () => {
        const subject = createTest('test');
        const invalidEpic = () => null;
        try {
            subject.addEpic(invalidEpic as unknown as Epic<Action, State>);
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err).toBeInstanceOf(TypeError);
        }
    });

    it('it should handle epics that fails', () => {
        const subject = createTest('test');
        const epic = () => throwError(() => Error('as expected'));
        const consoleError = console.error;
        console.error = jest.fn();
        subject.addEpic(epic);
        subject.next({ type: 'test', payload: '' });
        expect(console.error).toBeCalledTimes(1);
        console.warn = consoleError;
    });

    it('should reset to initial value', () => {
        const expected = ['initial', 'test'];
        const subject = createTest(expected[0]);
        const initial = subject.value;
        subject.next({ type: 'test', payload: expected[1] });
        expect(subject.value.value).toEqual(expected[1]);
        subject.reset();
        expect(subject.value).toEqual(initial);
    });

    it('should convert to observable', () => {
        const subject = createTest('test');
        const observable = subject.asObservable();
        expect(observable).toBeInstanceOf(Observable);
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

        const consoleWarn = console.warn;
        console.warn = jest.fn();
        subject.addEffect(expectedActions[0].type, () => {
            throw Error('Should not bork code!');
        });

        subject.addEffect('effect', () => {
            expect(console.warn).toBeCalledTimes(1);
            console.warn = consoleWarn;
            subject.complete();
        });

        subject.next(expectedActions[0]);
    });
});

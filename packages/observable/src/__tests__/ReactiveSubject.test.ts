import { merge, tap } from 'rxjs';
import { filterAction, switchMapAction } from '../operators';

import { ReactiveSubject } from '../ReactiveSubject';

type State = {
    id?: string | number;
    name?: string;
};

const reducer = (
    state: State,
    action: { type: 'mutate'; payload: State } | { type: 'SET_NAME'; payload: { name: string } }
) => {
    switch (action.type) {
        case 'mutate':
            return action.payload;
        case 'SET_NAME':
            return state.name === action.payload.name ? state : { ...state, ...action.payload };
    }
    return state;
};

describe('Reactive subject', () => {
    it('should create instance', () => {
        const initial = {};
        const obj = new ReactiveSubject(reducer, initial);
        expect(obj).not.toBeNull;
        expect(obj.value).toEqual(initial);
    });

    it('should mutate state', (done) => {
        const initial = {};
        const obj = new ReactiveSubject(reducer, initial);
        const next = { id: 55 };
        obj.subscribe((state) => {
            expect(state).toBe(next);
            done();
        });
        obj.dispatch({ type: 'mutate', payload: next });
    });

    it('should lift as observable', (done) => {
        const initial = {};
        const obj = new ReactiveSubject(reducer, initial);
        const next = { id: 55 };
        const copy = obj.asObservable();
        copy.subscribe((state) => {
            expect(state).toEqual(next);
            done();
        });
        obj.dispatch({ type: 'mutate', payload: next });
        done();
    });

    describe('Effects', () => {
        it('should add epic to subject', (done) => {
            const expectedStates: State[] = [
                { id: 'test1' },
                { id: 'test2' },
                { id: 'test2', name: 'test2' },
            ];
            const initial = {};
            const obj = new ReactiveSubject(reducer, initial);

            obj.addEpic((action$, _state$) => {
                const s1$ = action$.pipe(
                    switchMapAction(
                        'mutate',
                        async (
                            action
                        ): Promise<{
                            type: 'SET_NAME';
                            payload: { name: string };
                        }> => {
                            await new Promise((resolve) => setTimeout(resolve, 10));
                            return {
                                type: 'SET_NAME',
                                payload: { name: String(action.payload.id) },
                            };
                        }
                    )
                );
                const s2$ = action$.pipe(
                    filterAction('SET_NAME'),
                    tap(() => obj.complete())
                );
                return merge(s1$, s2$);
            });

            obj.subscribe({
                next: (state) => {
                    expect(state).toMatchObject(expectedStates.shift() || {});
                },
                complete: () => {
                    expect(obj.closed).toBeTruthy();
                    done();
                },
            });

            obj.dispatch({ type: 'mutate', payload: { id: 'test1' } });
            setTimeout(() => obj.dispatch({ type: 'mutate', payload: { id: 'test2' } }), 1);
        });

        it('should add effect to subject', (complete) => {
            const initial = {};
            const obj = new ReactiveSubject(reducer, initial);
            const payload = { id: 'test1', name: 'Foo' };
            obj.subscribe({ complete });
            obj.addEffect('mutate', async (action, state) => {
                expect(action.type).toBe('mutate');
                expect(action.payload).toEqual(payload);
                expect(action.payload).toEqual(state);
                obj.complete();
            });
            obj.dispatch({ type: 'mutate', payload });
        });

        it('should add effects to subject', (done) => {
            const expectedStates: State[] = [
                { id: 'test1' },
                { id: 'test1', name: 'test1' },
                { id: 'test2', name: 'test2' },
            ];

            const initial = {};
            const obj = new ReactiveSubject(reducer, initial);

            obj.addEffect(async (action) => {
                switch (action.type) {
                    case 'mutate':
                        return { type: 'SET_NAME', payload: { name: action.payload.id } } as {
                            type: 'SET_NAME';
                            payload: { name: string };
                        };
                    case 'SET_NAME':
                        obj.complete();
                        break;
                }
            });

            obj.subscribe({
                next: (state) => {
                    expect(state).toEqual(expectedStates.shift() || {});
                },
                complete: () => {
                    expect(obj.closed).toBeTruthy();
                    done();
                },
            });

            obj.dispatch({ type: 'mutate', payload: { id: 'test1' } });
            setTimeout(() => obj.dispatch({ type: 'mutate', payload: { id: 'test2' } }), 10);
        });
    });
});

import { from, of, tap } from 'rxjs';
import { filterAction, mapAction, switchMapAction } from '../operators';

describe('operators', () => {
    it('should filter actions', (complete) => {
        from([{ type: 'a' } as const, { type: 'b' } as const])
            .pipe(
                filterAction('b'),
                tap((action) => {
                    expect(action.type).toBe('b');
                })
            )
            .subscribe({ complete });
    });

    it('should map an action', (complete) => {
        const action = { type: `map-action`, payload: 'test-map-action' } as const;
        of(action)
            .pipe(mapAction('map-action', (action) => action.payload))
            .subscribe({
                next: (value) => {
                    expect(value).toBe(action.payload);
                },
                complete,
            });
    });

    it('should async map an action', (complete) => {
        const action = { type: `map-action`, payload: 'test-map-action' } as const;
        of(action)
            .pipe(switchMapAction('map-action', async (action) => action.payload))
            .subscribe({
                next: (value) => {
                    expect(value).toBe(action.payload);
                },
                complete,
            });
    });
});

import { useState, useEffect, useCallback } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';

import { describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { useObservableSelector } from '../../src/react';

describe('useObservableSelector', () => {
    it('should create an observable selector by path', async () => {
        const subject = new BehaviorSubject({ foo: { bar: 'initial' } });
        const { result } = renderHook(() => {
            const [value, setValue] = useState('');
            const selectedValue$ = useObservableSelector(subject, 'foo.bar');
            useEffect(() => {
                const sub = selectedValue$.subscribe(setValue);
                return () => sub.unsubscribe();
            }, [selectedValue$]);
            return { value, updateValue: subject.next };
        });

        expect(result.current.value).toBe('initial');
        expect(result.current.value).toBe(subject.value.foo.bar);

        await waitFor(() => {
            subject.next({ foo: { bar: 'test' } });
        });

        expect(result.current.value).toBe('test');
        expect(result.current.value).toBe(subject.value.foo.bar);
    });

    it('should create an observable selector by callback', async () => {
        type TestState = { foo: string };
        const subject = new Subject<TestState>();
        const { result } = renderHook(() => {
            const [value, setValue] = useState('');
            const selectedValue$ = useObservableSelector(
                subject,
                useCallback(
                    (state: TestState) => {
                        return state.foo;
                    },
                    [subject],
                ),
            );
            useEffect(() => {
                const sub = selectedValue$.subscribe(setValue);
                return () => sub.unsubscribe();
            }, [selectedValue$]);
            return { value, updateValue: subject.next };
        });

        await waitFor(() => {
            subject.next({ foo: 'bar' });
        });

        expect(result.current.value).to.equal('bar');
    });
});

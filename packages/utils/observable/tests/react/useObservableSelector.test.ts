import { useState, useEffect, useCallback } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';

import { describe, expect, it, vi } from 'vitest';

import { renderHook } from 'vitest-browser-react';

import { useObservableSelector } from '../../src/react';

describe('useObservableSelector', () => {
  it('should create an observable selector by path', async () => {
    const subject = new BehaviorSubject({ foo: { bar: 'initial' } });
    const { result } = await renderHook(() => {
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

    subject.next({ foo: { bar: 'test' } });

    await vi.waitFor(() => {
      expect(result.current.value).toBe('test');
      expect(result.current.value).toBe(subject.value.foo.bar);
    });
  });

  it('should create an observable selector by callback', async () => {
    type TestState = { foo: string };
    const subject = new Subject<TestState>();
    const { result } = await renderHook(() => {
      const [value, setValue] = useState('');
      const selectedValue$ = useObservableSelector(
        subject,
        useCallback((state: TestState) => {
          return state.foo;
        }, []),
      );
      useEffect(() => {
        const sub = selectedValue$.subscribe(setValue);
        return () => sub.unsubscribe();
      }, [selectedValue$]);
      return { value, updateValue: subject.next };
    });

    subject.next({ foo: 'bar' });

    await vi.waitFor(() => {
      expect(result.current.value).to.equal('bar');
    });
  });
});

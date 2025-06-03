import { describe, it, expect } from 'vitest';
import { isObservableInput } from '../src/is-observable-input';
import { toObservable } from '../src/to-observable';
import { from, Subject, Observable, of } from 'rxjs';

describe('createReducer', () => {
  describe('isObservableInput', () => {
    it('should return true for Promise', () => {
      expect(isObservableInput(Promise.resolve(1))).toBe(true);
    });

    it('should return true for Iterable', () => {
      expect(isObservableInput([1, 2, 3])).toBe(true);
      expect(isObservableInput(new Set([1, 2, 3]))).toBe(true);
    });

    it('should return true for rxjs Observable', () => {
      expect(isObservableInput(of(true))).toBe(true);
      expect(isObservableInput(from(Promise.resolve(true)))).toBe(true);
      expect(isObservableInput(new Subject())).toBe(true);
      // biome-ignore lint/suspicious/noEmptyBlockStatements: only test
      expect(isObservableInput(new Observable(() => {}))).toBe(true);
    });

    it('should return false for plain object', () => {
      expect(isObservableInput({ key: 'value' })).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isObservableInput(42)).toBe(false);
      expect(isObservableInput('string')).toBe(false);
      expect(isObservableInput(null)).toBe(false);
      expect(isObservableInput(undefined)).toBe(false);
      expect(isObservableInput(true)).toBe(false);
    });

    it('should return false for function', () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
      expect(isObservableInput(() => {})).toBe(false);
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
      expect(isObservableInput(async () => {})).toBe(false);
      // biome-ignore lint/complexity/useArrowFunction: <explanation>
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
      expect(isObservableInput(function () {})).toBe(false);
      // biome-ignore lint/complexity/useArrowFunction: <explanation>
      // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
      expect(isObservableInput(async function () {})).toBe(false);
    });
  });

  describe('toObservable', () => {
    it('should produce correct type for ObservableInput', () => {
      // Type-level test moved to dynamic-input-value.type-test.ts
    });
    it('should wrap a primitive value in an Observable', async () => {
      const values: number[] = [];
      toObservable(42).subscribe((v) => values.push(v));
      expect(values).toEqual([42]);
    });

    it('should wrap a plain object in an Observable', async () => {
      const values: Record<string, unknown>[] = [];
      toObservable({ foo: 'bar' }).subscribe((v) => values.push(v));
      expect(values).toEqual([{ foo: 'bar' }]);
    });

    it('should convert a Promise to an Observable', async () => {
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        toObservable(Promise.resolve(7)).subscribe({
          next: (v) => values.push(v),
          complete: resolve,
        });
      });
      expect(values).toEqual([7]);
    });

    it('should convert an Iterable to an Observable', () => {
      const values: number[] = [];
      toObservable([1, 2, 3]).subscribe((v) => values.push(v));
      expect(values).toEqual([1, 2, 3]);
    });

    it('should call a function and wrap its result in an Observable', () => {
      const fn = (x: number) => x * 2;
      const values: number[] = [];
      toObservable(fn, 5).subscribe((v) => values.push(v));
      expect(values).toEqual([10]);
    });

    it('should call a function with multiple arguments and wrap its result', () => {
      const fn = (a: number, b: number) => a + b;
      const values: number[] = [];
      toObservable(fn, 2, 3).subscribe((v) => values.push(v));
      expect(values).toEqual([5]);
    });

    it('should call an async function and wrap its resolved value in an Observable', async () => {
      const fn = async (x: number) => x * 3;
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        toObservable(fn, 4).subscribe({
          next: async (v) => values.push(await v),
          complete: resolve,
        });
      });
      expect(values).toEqual([12]);
    });

    it('should call a function returning a promise and wrap its resolved value', async () => {
      const fn = (x: number) => Promise.resolve(x * 4);
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        toObservable(fn, 3).subscribe({
          next: async (v) => values.push(await v),
          complete: resolve,
        });
      });
      expect(values).toEqual([12]);
    });

    it('should propagate errors from a function', async () => {
      const fn = () => {
        throw new Error('fail');
      };
      await expect(
        new Promise<void>((resolve, reject) => {
          // Use the 3-argument subscribe overload for compatibility
          toObservable(fn).subscribe(
            undefined, // next
            reject, // error
            () => resolve(), // complete
          );
        }),
      ).rejects.toThrow('fail');
    });

    it('should emit null if input is null', () => {
      const values: null[] = [];
      toObservable(null).subscribe((v) => values.push(v));
      expect(values).toEqual([null]);
    });

    it('should emit undefined if input is undefined', () => {
      const values: undefined[] = [];
      toObservable(undefined).subscribe((v) => values.push(v));
      expect(values).toEqual([undefined]);
    });

    it('should pass through an ObservableInput unchanged', () => {
      const obs = of('test');
      const values: string[] = [];
      toObservable(obs).subscribe((v) => values.push(v));
      expect(values).toEqual(['test']);
    });

    it('should convert a generator function result to an Observable', () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      const values: number[] = [];
      toObservable(gen()).subscribe((v) => values.push(v));
      expect(values).toEqual([1, 2, 3]);
    });

    it('should convert an async generator function result to an Observable', async () => {
      async function* asyncGen() {
        yield 10;
        yield 20;
        yield 30;
      }
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        toObservable(asyncGen()).subscribe({
          next: (v) => values.push(v),
          complete: resolve,
        });
      });
      expect(values).toEqual([10, 20, 30]);
    });
  });
});

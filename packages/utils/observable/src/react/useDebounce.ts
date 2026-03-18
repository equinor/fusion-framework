import { useCallback, useMemo, useState } from 'react';
import { from, type Observable, type ObservableInput, Subject } from 'rxjs';
import { debounce, debounceTime, switchMap, tap } from 'rxjs/operators';
import type { ObservableType } from '../types';

/**
 * Options for the {@link useDebounce} hook.
 *
 * @template TArgs - The argument tuple type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseDebounceOptions<TArgs extends any[]> = {
  /**
   * Either a numeric millisecond delay, or a function returning an
   * `ObservableInput` that controls the debounce duration per invocation.
   */
  debounce: ((value: TArgs) => ObservableInput<unknown>) | number;
  /** Optional custom `Subject` to use as the internal queue. */
  queuer?: Subject<TArgs>;
};

/**
 * React hook that debounces calls to a function and exposes the results as
 * an observable stream.
 *
 * Returns a `next` function (the debounced trigger), a `value$` observable
 * that emits results, and an `idle` flag indicating whether a debounced
 * call is in-flight.
 *
 * @template TFn - The wrapped function type.
 * @template TType - The return type of `TFn` (must be `ObservableInput`).
 * @template TArgs - The argument tuple.
 * @param fn - The function to debounce.
 * @param options - Debounce configuration.
 * @returns An object with `value$`, `next`, and `idle`.
 *
 * @example
 * ```tsx
 * const { next: search, value$, idle } = useDebounce(
 *   (query: string) => fetch(`/api/search?q=${query}`).then((r) => r.json()),
 *   { debounce: 300 },
 * );
 *
 * useObservableState(value$); // subscribe to results
 * search('fusion');           // triggers debounced fetch
 * ```
 */
export const useDebounce = <
  TFn extends (...args: TArgs) => TType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TType extends ObservableInput<any> = ReturnType<TFn>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends any[] = Parameters<TFn>,
>(
  fn: TFn,
  options: UseDebounceOptions<TArgs>,
): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value$: Observable<TType extends ObservableInput<any> ? ObservableType<TType> : TType>;
  next: (...args: TArgs) => void;
  idle: boolean;
} => {
  const [idle, setIdle] = useState<boolean>(true);

  const [queuer] = useState(() => options?.queuer ?? new Subject<TArgs>());

  const next = useCallback((...args: TArgs) => queuer.next(args), [queuer]);

  const debounceFn = useMemo(
    () =>
      typeof options.debounce === 'function'
        ? debounce(options.debounce)
        : debounceTime<TArgs>(options.debounce),
    [options.debounce],
  );

  const value$ = useMemo(
    () =>
      queuer.pipe(
        debounceFn,
        tap(() => setIdle(false)),
        switchMap((args) => from(fn(...args))),
        tap(() => setIdle(true)),
      ),
    [queuer, debounceFn, fn],
  );

  return { idle, next, value$ };
};

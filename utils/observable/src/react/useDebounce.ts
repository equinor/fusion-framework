import { useCallback, useMemo, useState } from 'react';
import { from, Observable, ObservableInput, Subject } from 'rxjs';
import { debounce, debounceTime, switchMap, tap } from 'rxjs/operators';
import { ObservableType } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseDebounceOptions<TArgs extends any[]> = {
    debounce: ((value: TArgs) => ObservableInput<unknown>) | number;
    queuer?: Subject<TArgs>;
};

export const useDebounce = <
    TFn extends (...args: TArgs) => TType,
    TType extends ObservableInput<any> = ReturnType<TFn>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TArgs extends any[] = Parameters<TFn>
>(
    fn: TFn,
    options: UseDebounceOptions<TArgs>
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
        [options.debounce]
    );

    const value$ = useMemo(
        () =>
            queuer.pipe(
                debounceFn,
                tap(() => setIdle(false)),
                switchMap((args) => from(fn(...args))),
                tap(() => setIdle(true))
            ),
        [fn]
    );

    return { idle, next, value$ };
};

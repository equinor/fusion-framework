import { useCallback } from 'react';

import { useObservableSelector, useObservableState } from '@equinor/fusion-observable/react';

import { useTodoStore } from './TodoProvider';
import type { TodoState } from './types';

/**
 * Subscribes to the full observable todo state.
 *
 * @returns The current todo state snapshot.
 */
export function useTodoState(): TodoState {
  const store = useTodoStore();
  return useObservableState(store.subject, { initial: store.subject.value }).value;
}

/**
 * Subscribes to a selected value from the observable todo state.
 *
 * @template TValue - Selected value type.
 * @param selector - Stable selector callback for the todo state.
 * @returns The selected todo state value.
 */
export function useTodoSelector<TValue>(selector: (state: TodoState) => TValue): TValue {
  const store = useTodoStore();
  const selected$ = useObservableSelector(store.subject, selector);
  return useObservableState<TValue, unknown, TValue>(selected$, {
    initial: selector(store.subject.value),
  }).value;
}

/**
 * Subscribes to the number of open todo items.
 *
 * @returns Current open todo count.
 */
export function useOpenTodoCount(): number {
  const selectOpenCount = useCallback(
    (state: TodoState) => state.items.filter((item) => !item.completed).length,
    [],
  );
  return useTodoSelector(selectOpenCount);
}

/**
 * Subscribes to the number of completed todo items.
 *
 * @returns Current completed todo count.
 */
export function useCompletedTodoCount(): number {
  const selectCompletedCount = useCallback(
    (state: TodoState) => state.items.filter((item) => item.completed).length,
    [],
  );
  return useTodoSelector(selectCompletedCount);
}

import type { ReactElement } from 'react';

import { useTodoStore } from './TodoProvider';
import { TodoButton } from './TodoButton';
import { useCompletedTodoCount } from './hooks';

/**
 * Renders the clear-completed command for the observable todo store.
 *
 * @returns A button that dispatches the clear completed action when completed todos exist.
 * @example
 * <TodoClearCompletedButton />
 */
export const TodoClearCompletedButton = (): ReactElement => {
  const store = useTodoStore();
  const completedCount = useCompletedTodoCount();
  const hasCompletedItems = completedCount > 0;

  return (
    <TodoButton onClick={() => store.dispatch.clearCompleted()} disabled={!hasCompletedItems}>
      Clear completed
    </TodoButton>
  );
};

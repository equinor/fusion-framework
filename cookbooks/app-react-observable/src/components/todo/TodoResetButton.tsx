import type { ReactElement } from 'react';

import { useTodoStore } from './TodoProvider';
import { TodoButton } from './TodoButton';

/**
 * Renders the reset command for the observable todo store.
 *
 * @returns A button that dispatches the todo reset action.
 * @example
 * <TodoResetButton />
 */
export const TodoResetButton = (): ReactElement => {
  const store = useTodoStore();

  return <TodoButton onClick={() => store.dispatch.reset()}>Reset todos</TodoButton>;
};

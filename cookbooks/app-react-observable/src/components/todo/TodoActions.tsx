import type { ReactElement } from 'react';

import { buttonRowStyle } from '../styles';
import { TodoClearCompletedButton } from './TodoClearCompletedButton';
import { TodoResetButton } from './TodoResetButton';

/**
 * Renders todo store command buttons.
 *
 * @returns Buttons for clearing completed items and resetting the todo store.
 * @example
 * <TodoActions />
 */
export const TodoActions = (): ReactElement => {
  return (
    <div style={buttonRowStyle}>
      <TodoClearCompletedButton />
      <TodoResetButton />
    </div>
  );
};

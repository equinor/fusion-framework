import type { ReactElement } from 'react';

import { buttonRowStyle } from '../styles';
import { useCompletedTodoCount, useOpenTodoCount } from './hooks';

/**
 * Renders selected todo counts from observable selectors.
 *
 * @returns Open and completed todo counts.
 * @example
 * <TodoStats />
 */
export const TodoStats = (): ReactElement => {
  const openCount = useOpenTodoCount();
  const completedCount = useCompletedTodoCount();

  return (
    <div style={buttonRowStyle}>
      <span>Open: {openCount}</span>
      <span>Done: {completedCount}</span>
    </div>
  );
};

import type { ReactElement } from 'react';

import { mutedTextStyle, panelStyle } from '../styles';
import { TodoActions } from './TodoActions';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';
import { TodoProvider } from './TodoProvider';
import { TodoStats } from './TodoStats';

/**
 * Demonstrates observable actions, reducers, dispatch mapping, selectors, and drag/drop reordering.
 *
 * @returns UI for a mini todo app backed by `createState`, context, and `FlowSubject`.
 * @example
 * <TodoApp />
 */
export const TodoApp = (): ReactElement => {
  return (
    <TodoProvider>
      <article style={{ ...panelStyle, gridColumn: 'span 2' }}>
        <h2 style={{ margin: 0 }}>Actions and reducers</h2>
        <p style={mutedTextStyle}>
          `createAction` and `createState` back this todo list with typed dispatch functions,
          reducer cases, selectors, context, and native drag/drop reordering.
        </p>
        <TodoForm />
        <TodoStats />
        <TodoList />
        <TodoActions />
      </article>
    </TodoProvider>
  );
};

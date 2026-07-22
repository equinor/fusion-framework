import {
  createContext,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useMemo,
} from 'react';

import { createTodoStore, type TodoStore } from './store';

const TodoStoreContext = createContext<TodoStore | null>(null);

/**
 * Provides the observable todo store to the todo feature components.
 *
 * @param children - Todo feature content that reads from the store.
 * @returns A context provider with one store instance for the subtree.
 * @example
 * <TodoProvider><TodoList /></TodoProvider>
 */
export const TodoProvider = ({ children }: PropsWithChildren): ReactElement => {
  const store = useMemo(() => createTodoStore(), []);

  return <TodoStoreContext.Provider value={store}>{children}</TodoStoreContext.Provider>;
};

/**
 * Reads the observable todo store from context.
 *
 * @returns The todo store for the current provider.
 * @throws When used outside `TodoProvider`.
 */
export function useTodoStore(): TodoStore {
  const store = useContext(TodoStoreContext);
  if (!store) {
    throw new Error('useTodoStore must be used within TodoProvider');
  }

  return store;
}

import { TodoListManager } from '../components/Todo';

/** Demonstrates a replicated task list. */
export const Todo = () => {
  return (
    <div style={{ padding: '1rem' }}>
      <TodoListManager />
    </div>
  );
};

export default Todo;

import type { TodoItem } from './types';
import { TodoListItem } from './TodoListItem';

interface TodoListProps {
  items: TodoItem[];
  onToggle?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ items, onToggle, onRemove }) => (
  <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
    {items.length === 0 ? (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        No todos yet. Add one above to get started!
      </div>
    ) : (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((todo, index) => (
          <TodoListItem
            key={todo.id}
            todo={todo}
            isLast={index === items.length - 1}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </ul>
    )}
  </div>
);

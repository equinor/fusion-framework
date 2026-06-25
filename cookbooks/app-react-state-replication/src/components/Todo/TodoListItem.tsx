import type { TodoItem } from './types';

interface TodoListItemProps {
  todo: TodoItem;
  isLast: boolean;
  onToggle?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const TodoListItem: React.FC<TodoListItemProps> = ({ todo, isLast, onToggle, onRemove }) => (
  <li
    style={{
      padding: '12px 16px',
      borderBottom: !isLast ? '1px solid #e0e0e0' : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: todo.completed ? '#f8f9fa' : 'white',
    }}
  >
    {onToggle && (
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ cursor: 'pointer' }}
      />
    )}
    <span
      style={{
        flex: 1,
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? '#6c757d' : 'inherit',
      }}
    >
      {todo.title}
    </span>
    <span style={{ fontSize: '12px', color: '#6c757d' }}>
      {new Date(todo.createdAt).toLocaleDateString()}
    </span>
    {onRemove && (
      <button
        type="button"
        onClick={() => onRemove(todo.id)}
        style={{
          background: 'none',
          border: 'none',
          color: '#dc3545',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '4px',
        }}
        title="Delete todo"
      >
        ✕
      </button>
    )}
  </li>
);

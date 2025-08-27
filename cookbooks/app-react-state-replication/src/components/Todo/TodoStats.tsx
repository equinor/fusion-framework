import type { TodoItem } from './types';

interface TodoStatsProps {
  items: TodoItem[];
  onClearCompleted: () => void;
}

export const TodoStats: React.FC<TodoStatsProps> = ({ items, onClearCompleted }) => {
  const activeCount = items.filter((item) => !item.completed).length;
  const completedCount = items.filter((item) => item.completed).length;
  return (
    <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
      <span>Active: {activeCount}</span>
      {' • '}
      <span>Completed: {completedCount}</span>
      {' • '}
      <span>Total: {items.length}</span>
      {completedCount > 0 && (
        <>
          {' • '}
          <button
            onClick={onClearCompleted}
            style={{
              background: 'none',
              border: 'none',
              color: '#007acc',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
            type="button"
          >
            Clear Completed
          </button>
        </>
      )}
    </div>
  );
};

import type { TodoItem } from './types';

interface TodoStatsProps {
  items: TodoItem[];
  onClearCompleted: () => void;
}

/** Summarizes active and completed task counts. */
export const TodoStats: React.FC<TodoStatsProps> = ({ items, onClearCompleted }) => {
  // Count active items for the summary shown above the list.
  const activeCount = items.filter((item) => !item.completed).length;
  // Count completed items to show progress and enable clearing them.
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

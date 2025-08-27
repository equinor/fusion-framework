import { useAppState } from '@equinor/fusion-framework-react-app/state';
import { TodoList } from '../components/Todo';
import type { TodoList as TodoItemsList } from '../components/Todo/types';

export const Home = () => {
  const [todos] = useAppState<TodoItemsList>('todos', {
    defaultValue: {
      items: [],
      lastModified: new Date().toISOString(),
    },
  });
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🔄 CouchDB State Replication Cookbook</h1>
      <p>
        This cookbook demonstrates real-time state synchronization between your React app and a
        local CouchDB instance using the Fusion Framework state module.
      </p>

      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h3>🐳 Quick Start</h3>
        <ol style={{ margin: '8px 0' }}>
          <li>
            Start CouchDB: <code>pnpm couchdb:up</code>
          </li>
          <li>
            Access CouchDB UI:{' '}
            <a href="http://localhost:5984/_utils" target="_blank" rel="noopener noreferrer">
              http://localhost:5984/_utils
            </a>
          </li>
          <li>Login with: admin / password</li>
          <li>Make changes below and watch them sync!</li>
        </ol>
      </div>

      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f3e5f5',
          borderRadius: '8px',
        }}
      >
        <h3>🔬 How it Works</h3>
        <ul style={{ margin: '8px 0' }}>
          <li>
            <strong>Local Storage:</strong> Uses PouchDB for offline-first functionality
          </li>
          <li>
            <strong>Remote Sync:</strong> Automatically replicates to CouchDB when online
          </li>
          <li>
            <strong>Live Updates:</strong> Changes appear in real-time across app instances
          </li>
          <li>
            <strong>Conflict Resolution:</strong> Handles concurrent edits gracefully
          </li>
        </ul>
      </div>

      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#e8f5e8',
          borderRadius: '8px',
        }}
      >
        <h3>🧪 Test Multi-Instance Sync</h3>
        <p>
          Open this app in multiple browser tabs or windows. Changes made in one instance will
          automatically appear in others thanks to live replication!
        </p>
      </div>

      <div
        style={{
          marginTop: '40px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
        }}
      >
        <h3>📖 Learning Resources</h3>
        <ul>
          <li>
            <a
              href="https://pouchdb.com/guides/replication.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              PouchDB Replication Guide
            </a>
          </li>
          <li>
            <a
              href="https://docs.couchdb.org/en/stable/replication/intro.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              CouchDB Replication Docs
            </a>
          </li>
          <li>
            <a
              href="https://github.com/equinor/fusion-framework/tree/main/packages/modules/state"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fusion State Module
            </a>
          </li>
        </ul>
      </div>
      <h3>📝 Your Todos</h3>
      <TodoList items={todos?.items ?? []} />
    </div>
  );
};

export default Home;

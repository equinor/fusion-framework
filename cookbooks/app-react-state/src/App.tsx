import Router from './Router';

/**
 * Main App component for the Fusion Framework state module cookbook.
 *
 * Demonstrates `useAppState` for persistent, cross-component-synced app state - by default
 * backed by local storage, or optionally by CouchDB replication (see `src/config.ts`) so state
 * syncs across browser tabs, devices, and sessions.
 */
export const App = () => {
  return <Router />;
};

export default App;

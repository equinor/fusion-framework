import { ProfileManager } from './components/ProfileManager';
import Router from './Router';

/**
 * Main App component for the State Replication Cookbook
 *
 * This application demonstrates how to sync state between a React app
 * and a CouchDB database using the Fusion Framework state module.
 */
export const App = () => {
  return <Router />;
};

export default App;

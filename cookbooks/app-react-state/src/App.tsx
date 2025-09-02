import { UserProfileControls } from './UserProfileControls';
import { UserProfileDisplay } from './UserProfileDisplay';
import { SimpleStateExamples } from './SimpleStateExamples';

/**
 * Main App component demonstrating useAppState patterns
 *
 * This component serves as the main container for the cookbook,
 * showcasing both simple and advanced state management patterns.
 */
export const App = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>🔄 Fusion State Module Cookbook</h1>
      <p>
        Learn how to use <code>useAppState</code> for managing application state in Fusion Framework
        apps.
      </p>

      {/* SECTION 1: Basic State Examples */}
      <SimpleStateExamples />

      {/* SECTION 2: Shared Object State */}
      <section>
        <h2>🔗 Shared Object State</h2>
        <p>
          The components below demonstrate sharing complex object state using the same state key:{' '}
          <code>'userProfile'</code>
        </p>
        <p>
          <strong>Key Learning:</strong> Multiple components can access and modify the same state
          using the same key.
        </p>

        {/* Display component shows current state */}
        <UserProfileDisplay />

        {/* Controls component allows state modification */}
        <UserProfileControls />
      </section>
    </div>
  );
};

export default App;

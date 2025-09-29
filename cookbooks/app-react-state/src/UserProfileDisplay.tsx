import { useAppState } from '@equinor/fusion-framework-react-app/state';
import type { UserProfile } from './types';

/**
 * UserProfileDisplay - Read-only component demonstrating state consumption
 *
 * Key Learning Points:
 * - Shows how to consume shared state without modifying it
 * - Demonstrates reactive UI updates when state changes elsewhere
 * - Uses the same state key as UserProfileControls: 'userProfile'
 */
export const UserProfileDisplay = () => {
  // Only destructure the state value (not the setter) since this is read-only
  const [userProfile] = useAppState<UserProfile>('userProfile', {
    defaultValue: {
      name: 'Anonymous',
      age: 25,
      theme: 'light',
      isActive: true,
    },
  });

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        margin: '16px 0',
        backgroundColor: userProfile?.theme === 'dark' ? '#2d2d2d' : '#f9f9f9',
        color: userProfile?.theme === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      <h3>📖 Read-Only Display Component</h3>

      <div style={{ marginBottom: '16px' }}>
        <p>
          <strong>State Key:</strong> <code>'userProfile'</code>
        </p>
        <p>
          <strong>Purpose:</strong> Display shared state (no modifications)
        </p>
      </div>

      <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
        <p>
          <strong>👤 Name:</strong> {userProfile?.name}
        </p>
        <p>
          <strong>🎂 Age:</strong> {userProfile?.age} years
        </p>
        <p>
          <strong>🎨 Theme:</strong> {userProfile?.theme}
        </p>
        <p>
          <strong>📊 Status:</strong> {userProfile?.isActive ? '🟢 Active' : '🔴 Inactive'}
        </p>
      </div>

      <div
        style={{
          fontSize: '0.875rem',
          color: userProfile?.theme === 'dark' ? '#cccccc' : '#666666',
          fontStyle: 'italic',
        }}
      >
        💡 This component automatically updates when the UserProfileControls component modifies the
        shared state.
      </div>
    </div>
  );
};

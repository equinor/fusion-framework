import { Button } from '@equinor/eds-core-react';
import { useAppState } from '@equinor/fusion-framework-react-app/state';
import type { UserProfile } from './types';

/**
 * UserProfileControls - Interactive component demonstrating state updates
 *
 * Key Learning Points:
 * - Shows different patterns for updating complex object state
 * - Demonstrates functional updates to avoid state mutation
 * - Uses the same state key as UserProfileDisplay: 'userProfile'
 * - Shows how changes immediately reflect in other components
 */
export const UserProfileControls = () => {
  // Destructure both state value and setter since this component modifies state
  const [userProfile, setUserProfile] = useAppState<UserProfile>('userProfile', {
    defaultValue: {
      name: 'Anonymous',
      age: 25,
      theme: 'light',
      isActive: true,
    },
  });

  // PATTERN 1: Functional update for single property change
  // Always use spread operator to avoid mutating the original object
  const incrementAge = () =>
    setUserProfile((prev) => (prev ? { ...prev, age: prev.age + 1 } : undefined));

  const decrementAge = () =>
    setUserProfile((prev) => (prev ? { ...prev, age: Math.max(0, prev.age - 1) } : undefined));

  // PATTERN 2: Functional update with conditional logic
  const toggleTheme = () =>
    setUserProfile((prev) =>
      prev ? { ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' } : undefined,
    );

  const toggleStatus = () =>
    setUserProfile((prev) => (prev ? { ...prev, isActive: !prev.isActive } : undefined));

  // PATTERN 3: Direct update for simple property change
  const updateName = (name: string) =>
    setUserProfile((prev) => (prev ? { ...prev, name } : undefined));

  // PATTERN 4: Complete state replacement
  const resetProfile = () =>
    setUserProfile({ name: 'Anonymous', age: 25, theme: 'light', isActive: true });

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #2196f3',
        borderRadius: '8px',
        margin: '16px 0',
        backgroundColor: userProfile?.theme === 'dark' ? '#2d2d2d' : '#f9f9f9',
        color: userProfile?.theme === 'dark' ? '#ffffff' : '#000000',
      }}
    >
      <h3>⚙️ Interactive Controls Component</h3>

      <div style={{ marginBottom: '16px' }}>
        <p>
          <strong>State Key:</strong> <code>'userProfile'</code>
        </p>
        <p>
          <strong>Purpose:</strong> Modify shared state using various update patterns
        </p>
      </div>

      {/* Current State Display */}
      <div
        style={{
          marginBottom: '20px',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <p>
          <strong>Current State:</strong>
        </p>
        <p>
          👤 {userProfile?.name} | 🎂 {userProfile?.age} | 🎨 {userProfile?.theme} | 📊{' '}
          {userProfile?.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {/* Name Input */}
        <div>
          <label
            htmlFor="user-name-input"
            style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
          >
            👤 Update Name:
          </label>
          <input
            id="user-name-input"
            type="text"
            value={userProfile?.name || ''}
            onChange={(e) => updateName(e.target.value)}
            placeholder="Enter name..."
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              backgroundColor: userProfile?.theme === 'dark' ? '#444' : '#fff',
              color: userProfile?.theme === 'dark' ? '#fff' : '#000',
            }}
          />
          <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            💡 Pattern: Direct property update with functional setter
          </p>
        </div>

        {/* Age Controls */}
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎂 Age Controls:</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button onClick={decrementAge} size="small">
              -1 Year
            </Button>
            <span style={{ minWidth: '60px', textAlign: 'center' }}>{userProfile?.age} years</span>
            <Button onClick={incrementAge} size="small">
              +1 Year
            </Button>
          </div>
          <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            💡 Pattern: Functional update with validation (age ≥ 0)
          </p>
        </div>

        {/* Toggle Controls */}
        <div>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔄 Toggle Controls:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button onClick={toggleTheme} variant="outlined">
              🎨 Switch to {userProfile?.theme === 'light' ? 'Dark' : 'Light'} Theme
            </Button>
            <Button onClick={toggleStatus} variant="outlined">
              📊 {userProfile?.isActive ? 'Deactivate' : 'Activate'} User
            </Button>
          </div>
          <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            💡 Pattern: Conditional functional updates
          </p>
        </div>

        {/* Reset Button */}
        <div>
          <Button onClick={resetProfile} variant="contained" color="secondary">
            🔄 Reset to Default Profile
          </Button>
          <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            💡 Pattern: Complete state replacement
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          fontSize: '0.875rem',
          color: userProfile?.theme === 'dark' ? '#cccccc' : '#666666',
          fontStyle: 'italic',
        }}
      >
        💡 Watch how changes here immediately update the UserProfileDisplay component above!
      </div>
    </div>
  );
};

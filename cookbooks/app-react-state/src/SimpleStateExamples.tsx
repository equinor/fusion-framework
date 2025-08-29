import { Button } from '@equinor/eds-core-react';
import { useAppState } from '@equinor/fusion-framework-react-app/state';
import type { Language } from './types';

/**
 * SimpleStateExamples - Component demonstrating basic useAppState patterns
 *
 * This component showcases three fundamental patterns:
 * 1. Boolean state management
 * 2. String state with type safety
 * 3. Optional state (can be undefined)
 *
 * Key Learning Points:
 * - How to use useAppState with different data types
 * - Providing default values for better UX
 * - Hierarchical state key naming conventions
 * - Simple state update patterns
 */
export const SimpleStateExamples = () => {
  // EXAMPLE 1: Boolean state management
  // State key: 'app.notifications.enabled' - hierarchical naming for app settings
  const [isNotificationEnabled, setIsNotificationEnabled] = useAppState<boolean>(
    'app.notifications.enabled',
    { defaultValue: true }, // Always provide sensible defaults
  );

  // EXAMPLE 2: String state with type safety
  // Using custom Language type for better type safety
  const [currentLanguage, setCurrentLanguage] = useAppState<Language>('app.language', {
    defaultValue: 'en',
  });

  // EXAMPLE 3: Optional state (can be undefined)
  // No default value means it starts as undefined
  const [lastLoginTime, setLastLoginTime] = useAppState<string>('user.lastLogin');

  // Example of simple state update - setting current timestamp as string
  const handleLogin = () => {
    setLastLoginTime(new Date().toLocaleString());
  };

  return (
    <section style={{ marginBottom: '40px' }}>
      <h2>📚 Basic State Management</h2>
      <div style={{ border: '2px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
        {/* Boolean State Example */}
        <div style={{ marginBottom: '24px' }}>
          <h3>Boolean State: Notifications</h3>
          <p>
            <strong>Current Value:</strong> {isNotificationEnabled ? '✅ Enabled' : '❌ Disabled'}
          </p>
          <p>
            <strong>State Key:</strong> <code>'app.notifications.enabled'</code>
          </p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => setIsNotificationEnabled(true)}
              variant={isNotificationEnabled ? 'contained' : 'outlined'}
            >
              Enable
            </Button>
            <Button
              onClick={() => setIsNotificationEnabled(false)}
              variant={!isNotificationEnabled ? 'contained' : 'outlined'}
            >
              Disable
            </Button>
          </div>
        </div>

        {/* String State Example */}
        <div style={{ marginBottom: '24px' }}>
          <h3>String State: Language Selection</h3>
          <p>
            <strong>Current Value:</strong> {currentLanguage}
          </p>
          <p>
            <strong>State Key:</strong> <code>'app.language'</code>
          </p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              onClick={() => setCurrentLanguage('en')}
              variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
              size="small"
            >
              English
            </Button>
            <Button
              onClick={() => setCurrentLanguage('no')}
              variant={currentLanguage === 'no' ? 'contained' : 'outlined'}
              size="small"
            >
              Norsk
            </Button>
            <Button
              onClick={() => setCurrentLanguage('es')}
              variant={currentLanguage === 'es' ? 'contained' : 'outlined'}
              size="small"
            >
              Español
            </Button>
          </div>
        </div>

        {/* Optional State Example */}
        <div>
          <h3>Optional State: Last Login Time</h3>
          <p>
            <strong>Current Value:</strong> {lastLoginTime || 'Never logged in'}
          </p>
          <p>
            <strong>State Key:</strong> <code>'user.lastLogin'</code>
          </p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <Button onClick={handleLogin} variant="outlined">
              Simulate Login
            </Button>
            <Button
              onClick={() => setLastLoginTime(undefined)}
              variant="outlined"
              disabled={!lastLoginTime}
            >
              Clear Login Time
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

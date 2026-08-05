import { Button } from '@equinor/eds-core-react';
import { useAppState } from '@equinor/fusion-framework-react-app/state';

/**
 * Demonstrates the fundamentals of `useAppState` - boolean, string, and optional
 * state - before the `Profile` and `Todos` pages layer replication on top.
 */
export const Basics = () => {
  // Always provide a default value for state a reader expects to exist immediately.
  const [notificationsEnabled, setNotificationsEnabled] = useAppState<boolean>(
    'app.notifications.enabled',
    { defaultValue: true },
  );

  const [language, setLanguage] = useAppState<'en' | 'no' | 'es'>('app.language', {
    defaultValue: 'en',
  });

  // No default value means the state starts as `undefined` until the user acts.
  const [lastLoginTime, setLastLoginTime] = useAppState<string>('user.lastLogin');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📚 useAppState Basics</h1>
      <p>
        Every state key below is stored and replicated the same way as the <code>Profile</code> and{' '}
        <code>Todos</code> pages - <code>useAppState</code> doesn't distinguish between a plain
        boolean and a synced document.
      </p>

      <div
        style={{
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>Boolean state: notifications</h3>
        <p>
          <strong>Current value:</strong> {notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={() => setNotificationsEnabled(true)}
            variant={notificationsEnabled ? 'contained' : 'outlined'}
          >
            Enable
          </Button>
          <Button
            onClick={() => setNotificationsEnabled(false)}
            variant={!notificationsEnabled ? 'contained' : 'outlined'}
          >
            Disable
          </Button>
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>String state: language</h3>
        <p>
          <strong>Current value:</strong> {language}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['en', 'no', 'es'] as const)
            // Render one button per supported language option.
            .map((option) => (
              <Button
                key={option}
                onClick={() => setLanguage(option)}
                variant={language === option ? 'contained' : 'outlined'}
                size="small"
              >
                {option}
              </Button>
            ))}
        </div>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Optional state: last login</h3>
        <p>
          <strong>Current value:</strong> {lastLoginTime ?? 'Never logged in'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={() => setLastLoginTime(new Date().toLocaleString())} variant="outlined">
            Simulate login
          </Button>
          <Button
            onClick={() => setLastLoginTime(undefined)}
            variant="outlined"
            disabled={!lastLoginTime}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Basics;

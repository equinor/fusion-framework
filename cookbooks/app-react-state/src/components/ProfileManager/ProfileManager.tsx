import { useCallback } from 'react';

import { useAppState } from '@equinor/fusion-framework-react-app/state';

import type { UserProfile } from '../../types';

// Used only the very first time this cookbook runs on a fresh browser/database - after that,
// `useAppState` returns whatever the user last saved, exactly like `localStorage` would.
const defaultProfile: UserProfile = {
  id: 'user-001',
  name: 'Anonymous User',
  email: 'anonymous@example.com',
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: { email: true, push: false },
  },
  lastModified: new Date().toISOString(),
};

// Shared inline styles, kept local to this file per the cookbook convention of avoiding
// shared utilities - see .github/instructions/cookbooks.instructions.md.
const sectionStyle = {
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  marginBottom: '20px',
};
const inputStyle = {
  marginLeft: '8px',
  padding: '4px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

/**
 * Demonstrates *object* state with `useAppState` - a single `user.profile` document holding a
 * name, email, and nested preferences, all updated through plain immutable object spreads.
 *
 * There is no reducer, action creator, or extra library here on purpose: `useAppState`'s setter
 * accepts the same `(value) => newValue` updater function `useState` does, so managing an object
 * this rich needs nothing more than that.
 *
 * When CouchDB replication is configured (see `src/config.ts`), edits made here reach every other
 * open tab or device within seconds - try opening this page in two browser tabs.
 */
export const ProfileManager = () => {
  const [profile, setProfile] = useAppState<UserProfile>('user.profile', {
    defaultValue: defaultProfile,
  });

  // Every field below calls this with just the part of the profile it owns. It spreads that
  // patch on top of the previous profile and stamps `lastModified`, so callers never repeat the
  // "copy everything else, then change one thing" boilerplate themselves.
  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => {
        // `prev` is only ever undefined for the instant before `defaultValue` above resolves.
        if (!prev) return prev;
        // Keep every existing field, overwrite only what changed, and refresh the timestamp.
        return { ...prev, ...patch, lastModified: new Date().toISOString() };
      });
    },
    [setProfile],
  );

  // Preferences are nested one level deeper, so this merges into `preferences` specifically
  // rather than replacing the whole object (which would drop sibling preference fields).
  const updatePreferences = useCallback(
    (patch: Partial<UserProfile['preferences']>) => {
      // Nothing to update yet - `defaultValue` above hasn't resolved.
      if (!profile) return;
      // Merge the patch into the existing preferences, leaving the rest of the profile untouched.
      updateProfile({ preferences: { ...profile.preferences, ...patch } });
    },
    [profile, updateProfile],
  );

  // Guard against the brief instant before the default value above has resolved.
  if (!profile) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>👤 User Profile</h1>
      <p>
        One <code>useAppState</code> key ("user.profile") holds this entire object. Every field
        below updates it with an immutable spread - the hook doesn't distinguish between a simple
        boolean and a nested object like this one.
      </p>

      <div style={sectionStyle}>
        <label>
          <strong>Name:</strong>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            style={inputStyle}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <label>
          <strong>Email:</strong>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => updateProfile({ email: e.target.value })}
            style={inputStyle}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <strong>Theme:</strong>
        <button
          type="button"
          onClick={() =>
            updatePreferences({ theme: profile.preferences.theme === 'light' ? 'dark' : 'light' })
          }
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {profile.preferences.theme} mode
        </button>
      </div>

      <div style={sectionStyle}>
        <label>
          <strong>Language:</strong>
          <select
            value={profile.preferences.language}
            onChange={(e) =>
              updatePreferences({
                language: e.target.value as UserProfile['preferences']['language'],
              })
            }
            style={inputStyle}
          >
            <option value="en">English</option>
            <option value="no">Norwegian</option>
            <option value="da">Danish</option>
            <option value="sv">Swedish</option>
          </select>
        </label>
      </div>

      <div style={sectionStyle}>
        <strong>Notifications:</strong>
        <label style={{ display: 'block', marginTop: '8px' }}>
          <input
            type="checkbox"
            checked={profile.preferences.notifications.email}
            onChange={(e) =>
              updatePreferences({
                notifications: { ...profile.preferences.notifications, email: e.target.checked },
              })
            }
          />{' '}
          Email
        </label>
        <label style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={profile.preferences.notifications.push}
            onChange={(e) =>
              updatePreferences({
                notifications: { ...profile.preferences.notifications, push: e.target.checked },
              })
            }
          />{' '}
          Push
        </label>
      </div>

      <p style={{ fontSize: '12px', color: '#666' }}>
        Last modified: {new Date(profile.lastModified).toLocaleString()}
      </p>
    </div>
  );
};

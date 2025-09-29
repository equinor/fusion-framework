import { ProfileManagerName } from './ProfileManagerName';
import { ProfileManagerEmail } from './ProfileManagerEmail';
import { ProfileManagerTheme } from './ProfileManagerTheme';
import { ProfileManagerEmailNotifications } from './ProfileManagerEmailNotifications';
import { ProfileManagerLastModified } from './ProfileManagerLastModified';
import { ProfileManagerPushNotifications } from './ProfileManagerPushNotifications';
import { ProfileManagerLanguage } from './ProfileManagerLanguage';
import { useProfileState } from './useProfileState';
import profileActions from './profileActions';

/**
 * Simple Profile Manager demonstrating CouchDB state replication
 */
export const ProfileManager: React.FC = () => {
  const [profile, dispatch] = useProfileState();

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h3>👤 User Profile (Synced with CouchDB)</h3>

      <ProfileManagerName
        name={profile.name}
        onUpdate={(name) => dispatch(profileActions.updateName(name))}
      />
      <ProfileManagerEmail
        email={profile.email}
        onUpdate={(email) => dispatch(profileActions.updateEmail(email))}
      />
      <ProfileManagerTheme
        theme={profile.preferences.theme}
        onToggle={() => dispatch(profileActions.toggleTheme())}
      />
      <ProfileManagerEmailNotifications
        emailNotifications={profile.preferences.notifications.email}
        onToggle={() => dispatch(profileActions.toggleEmailNotifications())}
      />
      <ProfileManagerLastModified lastModified={profile.lastModified} />

      <ProfileManagerPushNotifications
        pushNotifications={profile.preferences.notifications.push}
        onToggle={() => dispatch(profileActions.togglePushNotifications())}
      />

      <ProfileManagerLanguage
        language={profile.preferences.language}
        onUpdate={(language) => dispatch(profileActions.updateLanguage(language))}
      />
    </div>
  );
};

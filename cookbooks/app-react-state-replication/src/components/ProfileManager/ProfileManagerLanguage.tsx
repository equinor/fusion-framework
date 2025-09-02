import type { UserPreferences } from '../../types';

export interface ProfileManagerLanguageProps {
  language: UserPreferences['language'];
  onUpdate: (language: UserPreferences['language']) => void;
}

export const ProfileManagerLanguage: React.FC<ProfileManagerLanguageProps> = ({
  language,
  onUpdate,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label>
        <strong>Language:</strong>
        <select
          value={language}
          onChange={(e) => onUpdate(e.target.value as UserPreferences['language'])}
          style={{
            marginLeft: '8px',
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <option value="en">English</option>
          <option value="no">Norwegian</option>
          <option value="da">Danish</option>
          <option value="sv">Swedish</option>
        </select>
      </label>
    </div>
  );
};

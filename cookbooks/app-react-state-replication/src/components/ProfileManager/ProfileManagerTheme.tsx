export interface ProfileManagerThemeProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const ProfileManagerTheme: React.FC<ProfileManagerThemeProps> = ({ theme, onToggle }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div>
        <strong>Theme:</strong>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle theme"
          style={{
            marginLeft: '8px',
            padding: '4px 12px',
            backgroundColor: theme === 'light' ? '#fff' : '#333',
            color: theme === 'light' ? '#333' : '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {theme} mode
        </button>
      </div>
    </div>
  );
};

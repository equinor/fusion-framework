export interface ProfileManagerEmailProps {
  email: string;
  onUpdate: (email: string) => void;
}

export const ProfileManagerEmail: React.FC<ProfileManagerEmailProps> = ({ email, onUpdate }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label>
        <strong>Email:</strong>
        <input
          type="email"
          value={email}
          onChange={(e) => onUpdate(e.target.value)}
          style={{
            marginLeft: '8px',
            padding: '4px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </label>
    </div>
  );
};

export interface ProfileManagerNameProps {
  name: string;
  onUpdate: (name: string) => void;
}

export const ProfileManagerName: React.FC<ProfileManagerNameProps> = ({ name, onUpdate }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label>
        <strong>Name:</strong>
        <input
          type="text"
          value={name}
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

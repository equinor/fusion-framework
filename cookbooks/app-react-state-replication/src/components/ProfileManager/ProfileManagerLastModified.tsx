export interface ProfileManagerLastModifiedProps {
  lastModified: string;
}

export const ProfileManagerLastModified: React.FC<ProfileManagerLastModifiedProps> = ({
  lastModified,
}) => {
  return (
    <div style={{ fontSize: '12px', color: '#666' }}>
      Last modified: {new Date(lastModified).toLocaleString()}
    </div>
  );
};

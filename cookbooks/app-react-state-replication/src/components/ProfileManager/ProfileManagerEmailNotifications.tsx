export interface ProfileManagerEmailNotificationsProps {
  emailNotifications: boolean;
  onToggle: () => void;
}

/** Renders the email notification preference. */
export const ProfileManagerEmailNotifications: React.FC<ProfileManagerEmailNotificationsProps> = ({
  emailNotifications,
  onToggle,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label>
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={onToggle}
          style={{ marginRight: '8px' }}
        />
        <strong>Email Notifications</strong>
      </label>
    </div>
  );
};

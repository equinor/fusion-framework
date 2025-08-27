export interface ProfileManagerPushNotificationsProps {
  pushNotifications: boolean;
  onToggle: () => void;
}

export const ProfileManagerPushNotifications: React.FC<ProfileManagerPushNotificationsProps> = ({
  pushNotifications,
  onToggle,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label>
        <input
          type="checkbox"
          checked={pushNotifications}
          onChange={onToggle}
          style={{ marginRight: '8px' }}
        />
        <strong>Push Notifications</strong>
      </label>
    </div>
  );
};

import { Typography } from '@equinor/eds-core-react';
import type { SyncEvent } from '../../modules/app-state-with-replication';

interface SyncStatusIndicatorProps {
  event?: SyncEvent;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showTimestamp?: boolean;
}

const getStatusColor = (type: SyncEvent['type'] | unknown) => {
  switch (type) {
    case 'active':
    case 'change':
      return '#007BFF'; // Blue for syncing
    case 'paused':
    case 'complete':
      return '#28A745'; // Green for success
    case 'error':
      return '#DC3545'; // Red for error
    default:
      return '#6C757D'; // Gray for offline/unknown
  }
};

const getStatusText = (type: SyncEvent['type'] | unknown) => {
  switch (type) {
    case 'active':
      return 'Syncing...';
    case 'paused':
      return 'Up to date';
    case 'change':
      return 'Changes detected';
    case 'error':
      return 'Sync error';
    case 'complete':
      return 'Sync complete';
    default:
      return 'Offline';
  }
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return { dotSize: 8, gap: '6px' };
    case 'medium':
      return { dotSize: 12, gap: '8px' };
    case 'large':
      return { dotSize: 16, gap: '12px' };
  }
};

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  event,
  size = 'medium',
  showText = true,
  showTimestamp = true,
}) => {
  const { dotSize, gap } = getSizeConfig(size);
  const type = event?.type || 'offline';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <div
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: getStatusColor(type),
          flexShrink: 0,
        }}
      />
      {showText && (
        <Typography variant={size === 'small' ? 'body_short' : undefined}>
          {getStatusText(type)}
        </Typography>
      )}
      {showTimestamp && event && (
        <Typography variant="caption" style={{ color: '#6C757D' }}>
          {new Date(event.timestamp).toLocaleTimeString()}
        </Typography>
      )}
    </div>
  );
};

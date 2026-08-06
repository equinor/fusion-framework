import { Typography } from '@equinor/eds-core-react';
import { StateSyncEvent, type StateSyncEventType } from '@equinor/fusion-framework-react-app/state';

interface SyncStatusIndicatorProps {
  event?: StateSyncEventType;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  showTimestamp?: boolean;
}

type SyncStatusKind = 'active' | 'paused' | 'change' | 'complete' | 'poll' | 'error' | 'offline';

const getStatusKind = (event?: StateSyncEventType): SyncStatusKind => {
  // No event has arrived yet - either sync hasn't started, or replication isn't configured.
  if (!event) return 'offline';
  // Status events carry the raw active/paused replication state in their detail.
  if (StateSyncEvent.Status.is(event)) {
    return event.detail.status === 'unknown' ? 'offline' : event.detail.status;
  }
  // Every other sync event kind maps 1:1 to an indicator label.
  if (StateSyncEvent.Change.is(event)) return 'change';
  // A completed replication batch, whether or not anything actually changed.
  if (StateSyncEvent.Complete.is(event)) return 'complete';
  // Interval-mode polling (timer/focus/initial) - distinct from an actual error.
  if (StateSyncEvent.Poll.is(event)) return 'poll';
  // Any remaining sync event kind is an error.
  return 'error';
};

const getStatusColor = (kind: SyncStatusKind) => {
  // Map synchronization status kinds to the indicator palette.
  switch (kind) {
    case 'active':
    case 'change':
    case 'poll':
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

const getStatusText = (kind: SyncStatusKind) => {
  // Map synchronization status kinds to reader-friendly labels.
  switch (kind) {
    case 'active':
      return 'Syncing...';
    case 'paused':
      return 'Up to date';
    case 'change':
      return 'Changes detected';
    case 'poll':
      return 'Polling...';
    case 'error':
      return 'Sync error';
    case 'complete':
      return 'Sync complete';
    default:
      return 'Offline';
  }
};

const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
  // Keep the indicator dimensions consistent across display sizes.
  switch (size) {
    case 'small':
      return { dotSize: 8, gap: '6px' };
    case 'medium':
      return { dotSize: 12, gap: '8px' };
    case 'large':
      return { dotSize: 16, gap: '12px' };
  }
};

/** Displays the current synchronization status. */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  event,
  size = 'medium',
  showText = true,
  showTimestamp = true,
}) => {
  const { dotSize, gap } = getSizeConfig(size);
  const kind = getStatusKind(event);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <div
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: getStatusColor(kind),
          flexShrink: 0,
        }}
      />
      {showText && (
        <Typography variant={size === 'small' ? 'body_short' : undefined}>
          {getStatusText(kind)}
        </Typography>
      )}
      {showTimestamp && event && (
        <Typography variant="caption" style={{ color: '#6C757D' }}>
          {new Date(event.created).toLocaleTimeString()}
        </Typography>
      )}
    </div>
  );
};

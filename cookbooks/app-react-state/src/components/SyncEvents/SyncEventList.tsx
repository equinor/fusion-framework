import { Typography } from '@equinor/eds-core-react';
import type { StateSyncEventType } from '@equinor/fusion-framework-react-app/state';

import { SyncStatusIndicator } from './SyncStatusIndicator';

interface SyncEventListProps {
  events: StateSyncEventType[];
  maxHeight?: string;
}

/** Lists recent synchronization events, most recent first. */
export const SyncEventList: React.FC<SyncEventListProps> = ({ events, maxHeight = '200px' }) => {
  const latestFirst = events.slice().reverse();

  return (
    <div>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Recent Events ({events.length})
      </Typography>
      <div style={{ maxHeight, overflowY: 'auto' }}>
        {latestFirst.length > 0 ? (
          latestFirst.map((event, index) => (
            <div
              key={`${event.type}-${event.created}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: index < latestFirst.length - 1 ? '1px solid #E9ECEF' : 'none',
              }}
            >
              <SyncStatusIndicator
                event={event}
                size="small"
                showText={true}
                showTimestamp={true}
              />
            </div>
          ))
        ) : (
          <Typography variant="body_short" style={{ color: '#6C757D', fontStyle: 'italic' }}>
            No events recorded yet
          </Typography>
        )}
      </div>
    </div>
  );
};

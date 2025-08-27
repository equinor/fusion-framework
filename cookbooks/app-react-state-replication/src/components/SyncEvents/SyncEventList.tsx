import { Typography } from '@equinor/eds-core-react';

import type { SyncEvent } from '../../modules/app-state-with-replication';

import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useSyncEvents } from './useSyncEvents';

interface SyncEventListProps {
  maxEvents?: number;
  maxHeight?: string;
}

export const SyncEventList: React.FC<SyncEventListProps> = ({
  maxEvents = 10,
  maxHeight = '200px',
}) => {
  const events = useSyncEvents(maxEvents);
  return (
    <div>
      <Typography variant="h6" style={{ marginBottom: '8px' }}>
        Recent Events ({events.length}/{maxEvents})
      </Typography>
      <div style={{ maxHeight, overflowY: 'auto' }}>
        {events.length > 0 ? (
          events
            .slice()
            .reverse()
            .map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: index < events.length - 1 ? '1px solid #E9ECEF' : 'none',
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

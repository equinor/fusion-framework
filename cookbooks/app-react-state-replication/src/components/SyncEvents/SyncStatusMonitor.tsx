import { Paper, Typography } from '@equinor/eds-core-react';
import { useSyncEvents } from './useSyncEvents';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { SyncEventList } from './SyncEventList';

export const SyncStatusMonitor = (props: { height: string }) => {
  const [lastEvent] = useSyncEvents(1);

  return (
    <Paper elevation="sticky" style={{ height: props.height, padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Typography variant="h5" style={{ marginBottom: '1rem' }}>
          🔄 Sync Status Monitor
        </Typography>

        {/* Current Status */}
        <div style={{ marginLeft: 'auto' }}>
          <SyncStatusIndicator
            event={lastEvent}
            size="medium"
            showText={true}
            showTimestamp={true}
          />
        </div>
      </div>

      {/* Event Log */}
      <SyncEventList maxEvents={20} />
    </Paper>
  );
};

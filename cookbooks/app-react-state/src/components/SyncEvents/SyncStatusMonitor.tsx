import { Paper, Typography } from '@equinor/eds-core-react';
import { useStateSyncEvents } from '@equinor/fusion-framework-react-app/state';

import { SyncStatusIndicator } from './SyncStatusIndicator';
import { SyncEventList } from './SyncEventList';

/** Displays the latest synchronization status and event history. */
export const SyncStatusMonitor = (props: { height: string }) => {
  const events = useStateSyncEvents(20);
  const lastEvent = events.at(-1);

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
      <SyncEventList events={events} />
    </Paper>
  );
};

export default SyncStatusMonitor;


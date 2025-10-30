import { useEffect, useState } from 'react';
import type { LogEntry } from './types';
import { LogEntrySchema } from './schema';
import { v4 as uuid } from 'uuid';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { Button, Icon } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import { DateRange } from '@equinor/fusion-react-date';

export const LogReader = () => {
  const [activeLogEntry, setActiveLogEntry] = useState<LogEntry | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/@fusion-api/logs');
      const text = await response.text();
      const lines = text
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          return LogEntrySchema.parse(JSON.parse(line));
        });

      setEntries(lines.reverse());
    } catch (err) {
      setError(`Failed to fetch logs. ${err}`);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <>
      <div>{error}</div>
      <button type="button" onClick={fetchLogs}>
        Refresh
      </button>
      <table border={1}>
        <thead>
          <tr>
            <th>Service</th>
            <th>Version</th>
            <th>Scope</th>
            <th>Event</th>
            <th>Body</th>
            <th>Timestamp</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const resourceLog = entry.resourceLogs[0];
            const scopeLog = resourceLog.scopeLogs[0];
            const logRecord = scopeLog.logRecords[0];

            return (
              <tr key={uuid()}>
                <td>
                  {resourceLog.resource.attributes
                    .filter((attr) => attr.key === 'service.name')
                    .map((attr) => attr.value.stringValue)}
                </td>
                <td>
                  {resourceLog.resource.attributes
                    .filter((attr) => attr.key === 'service.version')
                    .map((attr) => attr.value.stringValue)}
                </td>
                <td>{scopeLog.scope.name}</td>
                <td>{logRecord.eventName}</td>
                <td>{JSON.stringify(logRecord.body)}</td>
                <td>
                  <DateRange
                    to={new Date(parseInt(logRecord.timeUnixNano) / 1_000_000)}
                    from={new Date()}
                    variant="distance"
                  />
                </td>
                <td>
                  <Button
                    variant="ghost_icon"
                    title="Show all data for this log entry"
                    onClick={() => setActiveLogEntry(entry)}
                  >
                    <Icon data={info_circle} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SideSheet
        isOpen={!!activeLogEntry}
        minWidth={480}
        isDismissable={true}
        onClose={() => {
          setActiveLogEntry(null);
        }}
      >
        <SideSheet.Title
          title={`Info: ${activeLogEntry?.resourceLogs[0].scopeLogs[0].logRecords[0].timeUnixNano}`}
        />
        <SideSheet.Content>
          <pre>{JSON.stringify(activeLogEntry, null, 2)}</pre>
        </SideSheet.Content>
      </SideSheet>
    </>
  );
};

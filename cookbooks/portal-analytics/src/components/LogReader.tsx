import { useCallback, useEffect, useState } from 'react';
import type { LogRecord } from '../types';
import { LogEntrySchema } from '../schema';
import { v4 as uuid } from 'uuid';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { Button, Icon } from '@equinor/eds-core-react';
import { info_circle } from '@equinor/eds-icons';
import { DateRange } from '@equinor/fusion-react-date';
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';

/**
 * Component to view the entries of the log file in a table.
 *
 * Will fetch the content from `/@fusion-api/logs`, parse it and display in
 * table.
 */
export const LogReader = () => {
  const [activeLogRecord, setActiveLogRecord] = useState<LogRecord | null>(null);
  const [records, setRecords] = useState<LogRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const trackFeature = useTrackFeature();

  /**
   * Will fetch, parse and store the log file entries in entries state
   */
  const fetchLogs = useCallback(async () => {
    trackFeature('cookbook:portal-analytics:logs:fetch', {
      foo: 'bar',
    });

    try {
      /**
       * Fetches the logs from a custom endpoint defined in `dev-server.config.ts`
       * Will provide the contents of the log file.
       * See README.md for more details.
       */
      const response = await fetch('/@fusion-api/logs');
      const text = await response.text();
      const allRecords = text
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          return LogEntrySchema.parse(JSON.parse(line));
        })
        .reverse()
        .reduce((acc, records) => {
          const logRecords = records.resourceLogs?.[0]?.scopeLogs?.[0]?.logRecords;
          if (Array.isArray(logRecords)) {
            acc.push(...logRecords);
          }
          return acc;
        }, [] as LogRecord[]);

      setRecords(allRecords);
    } catch (err) {
      setError(`Failed to fetch logs. ${err}`);
    }
  }, [trackFeature]);

  /**
   * Will clear the log entries if you want to clear the log file
   */
  const clearLogs = useCallback(async () => {
    trackFeature('cookbook:portal-analytics:logs:clear');
    /**
     * Requests a custom endpoint defined in `dev-server.config.ts`
     * Will clear the contents of the log file.
     * See README.md for more details.
     */
    await fetch('/@fusion-api/api/clearlogs');
    fetchLogs();
  }, [fetchLogs, trackFeature]);

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

      <button type="button" onClick={clearLogs}>
        Clear
      </button>
      <table border={1}>
        <thead>
          <tr>
            <th>Event</th>
            <th>Value</th>
            <th>Attributes</th>
            <th>Timestamp</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {records.map((logRecord) => {
            return (
              <tr key={uuid()}>
                <td>{logRecord.eventName}</td>
                <td>{JSON.stringify(logRecord.body)}</td>
                <td>{JSON.stringify(logRecord.attributes)}</td>
                <td>
                  <DateRange
                    to={new Date(parseInt(logRecord.timeUnixNano, 10) / 1_000_000)}
                    from={new Date()}
                    variant="distance"
                  />
                </td>
                <td>
                  <Button
                    variant="ghost_icon"
                    title="Show all data for this log record"
                    onClick={() => setActiveLogRecord(logRecord)}
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
        isOpen={!!activeLogRecord}
        minWidth={480}
        isDismissable={true}
        onClose={() => {
          setActiveLogRecord(null);
        }}
      >
        <SideSheet.Title title="Info" />
        <SideSheet.Content>
          <pre>{JSON.stringify(activeLogRecord, null, 2)}</pre>
        </SideSheet.Content>
      </SideSheet>
    </>
  );
};

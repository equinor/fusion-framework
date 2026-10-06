import type { RouterHandle } from '@equinor/fusion-framework-react-router';
import { useTrackFeature } from '@equinor/fusion-framework-react-app/analytics';
import { useState, type ReactElement } from 'react';

import { type AppFeatureEvent, useAppFeatureEvents } from '../../analytics';
import { HelpInfoButton } from '../../components/HelpInfoButton';

export const handle = {
  route: {
    description: 'Demonstrates tracking app features and reading them back as usage data.',
  },
} as const satisfies RouterHandle;

/** Feature name tracked by this page's button. */
const DEMO_FEATURE = 'demo-feature-tracked';

/**
 * Shows one tracked event as a list row.
 *
 * @param props.event - The event to show.
 * @returns The row element.
 */
function EventRow({ event }: { event: AppFeatureEvent }): ReactElement {
  return (
    <li data-testid="analytics-event">
      <strong>{event.data_feature}</strong> {event.data_body_data ?? '(no data)'} —{' '}
      {event.user_id ?? 'unknown user'} at {event.timestamp}
    </li>
  );
}

/**
 * Demonstrates usage analytics that can be checked before release.
 *
 * The button tracks an app feature with `useTrackFeature()`; every page also tracks a
 * `page-viewed` feature (see `usePageViewTracking`). With `--mock`, the dev portal sends both to
 * `ffc mock-server`, which reads them the way Fusion's analytics pipeline does. The list reads
 * them back through the Apps service's app-feature events query, together with the history
 * seeded from `mocks/analytics.seed.jsonl`.
 *
 * @returns A button that tracks a feature, and this app's events with loading and error states.
 *
 * @example
 * Navigate to `/analytics` while `ffc mock-server` and `ffc app dev --mock` run, click the button,
 * then refresh the list.
 */
export default function AnalyticsPage(): ReactElement {
  const trackFeature = useTrackFeature();
  const { events, loading, error, refresh } = useAppFeatureEvents();
  const [clicks, setClicks] = useState(0);

  /** Tracks the demo feature with how often it has been clicked on this page. */
  const trackDemoFeature = (): void => {
    const next = clicks + 1;
    setClicks(next);
    trackFeature(DEMO_FEATURE, { clicks: next });
  };

  // Loading, failure, and empty results each get their own message before the list renders.
  const status = loading
    ? 'Loading usage data...'
    : error
      ? `Failed to load usage data: ${error.message}`
      : events.length === 0
        ? 'No usage data yet.'
        : undefined;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <h2>Usage analytics</h2>
        <HelpInfoButton articleSlug="usage-analytics" label="Usage analytics" />
      </div>
      <p>
        The dev portal sends tracked features to <code>ffc mock-server</code>, which answers the app
        feature events query with them. Analytics are sent in batches, so allow a second before
        refreshing.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={trackDemoFeature}>
          Track demo feature
        </button>
        <button type="button" onClick={refresh}>
          Refresh usage data
        </button>
      </div>
      {status ? (
        <p data-testid="analytics-status">{status}</p>
      ) : (
        <ul data-testid="analytics-events">
          {events.map((event) => (
            <EventRow key={event.event_id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}

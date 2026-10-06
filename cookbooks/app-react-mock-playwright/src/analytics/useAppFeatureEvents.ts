import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
import { queryAppFeatureEvents } from '@equinor/fusion-services/apps';
import { useCallback, useEffect, useState } from 'react';

import { APP_KEY } from './app-key';
import { appFeatureEventsQuery } from './app-feature-events-query';

/** Most events shown on the analytics page. */
const PAGE_SIZE = 50;

/** One app-feature event, with the fields the analytics page shows. */
export interface AppFeatureEvent {
  /** Unique id of the stored event. */
  event_id: string;
  /** When the event happened, as an ISO 8601 timestamp. */
  timestamp: string | null;
  /** The tracked feature name, the first argument of `trackFeature`. */
  data_feature: string | null;
  /** The tracked data as JSON text, or `null` when the feature was tracked without data. */
  data_body_data: string | null;
  /** The user who tracked the feature. */
  user_id: string | null;
}

/** State returned by {@link useAppFeatureEvents}. */
export interface AppFeatureEventsState {
  /** The events, newest first. */
  events: AppFeatureEvent[];
  /** Whether a request is in flight. */
  loading: boolean;
  /** Why the last request failed, if it did. */
  error?: Error;
  /** Loads the events again, for example after tracking a feature. */
  refresh: () => void;
}

/**
 * Reads the events of a GraphQL response, failing on GraphQL errors or an unexpected shape.
 *
 * @param response - The response body.
 * @returns The events.
 * @throws {Error} When the response reports errors or has no event list.
 */
function readEvents(response: unknown): AppFeatureEvent[] {
  const { data, errors } = (response ?? {}) as {
    data?: { event_app_features?: { items?: unknown } };
    errors?: { message: string }[];
  };
  // GraphQL reports problems in the body with status 200, so they are checked explicitly.
  if (errors?.length) {
    // All messages are joined so none is hidden behind the first.
    const messages = errors.map(({ message }) => message).join('; ');
    throw new Error(messages);
  }
  const items = data?.event_app_features?.items;
  // Anything but a list means the service answered something other than the event dataset.
  if (!Array.isArray(items)) {
    throw new Error('The usage data response has no event list.');
  }
  return items as AppFeatureEvent[];
}

/**
 * Loads this app's most recent app-feature events from the Apps service's
 * `POST /apps/feature-events/query`, as an app's own usage page would.
 *
 * @remarks
 * Requires `configurator.useFrameworkServiceClient('apps')`. In production the Apps service only
 * answers app admins, and events appear after Fusion's analytics pipeline loads them. Locally,
 * `ffc mock-server` answers right away with the events of the current browser session plus any
 * seeded history.
 *
 * @returns The events, the loading and error state, and a `refresh` function.
 *
 * @example
 * ```tsx
 * const { events, loading, error, refresh } = useAppFeatureEvents();
 * ```
 */
export function useAppFeatureEvents(): AppFeatureEventsState {
  const client = useHttpClient('apps');
  const [state, setState] = useState<Omit<AppFeatureEventsState, 'refresh'>>({
    events: [],
    loading: true,
  });
  const [requested, setRequested] = useState(0);

  useEffect(() => {
    // `requested` only triggers the reload; it is not part of the request.
    void requested;
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: undefined }));
    queryAppFeatureEvents('v1', client)(
      { query: appFeatureEventsQuery, variables: { appKey: APP_KEY, first: PAGE_SIZE } },
      { signal: controller.signal },
    )
      .then((response) => setState({ events: readEvents(response), loading: false }))
      .catch((error: unknown) => {
        // A request cancelled by a newer one or by unmounting is not a failure to show.
        if (controller.signal.aborted) return;
        setState({
          events: [],
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });
    return () => controller.abort();
  }, [client, requested]);

  const refresh = useCallback(() => setRequested((count) => count + 1), []);
  return { ...state, refresh };
}

export default useAppFeatureEvents;
